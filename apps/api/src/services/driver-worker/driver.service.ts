import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { Prisma, OrderStatus } from "../../../generated/prisma/client.js";
import { hasActiveDriverTask } from "./attendance.utils.db.js";
import { attendanceService, assertShiftEligibility } from "./attendance.service.js";

const DRIVER_TASK_DETAIL_SELECT = {
  id: true,
  order_id: true,
  driver_id: true,
  task_type: true,
  status: true,
  taken_at: true,
  created_at: true,
  updated_at: true,
  order: {
    select: {
      id: true,
      invoice_number: true,
      outlet_id: true,
      pickup_address: { select: { address: true, latitude: true, longitude: true } },
      customer: { select: { full_name: true, phone: true } },
    },
  },
} satisfies Prisma.DriverTaskSelect;

type DriverTaskDetail = Prisma.DriverTaskGetPayload<{ select: typeof DRIVER_TASK_DETAIL_SELECT }>;

export function mapDriverTaskToActivePayload(task: DriverTaskDetail | null) {
  return {
    hasActiveTask: !!task,
    task: task
      ? {
          id: task.id,
          order_id: task.order_id,
          driver_id: task.driver_id,
          task_type: task.task_type,
          status: task.status,
          taken_at: task.taken_at,
          created_at: task.created_at,
          updated_at: task.updated_at,
          order: task.order,
        }
      : null,
  };
}

export const driverService = {
  async getAvailablePickupOrders(employeeId: string) {
    const outletId = await assertShiftEligibility(employeeId);
    const tasks = await prisma.driverTask.findMany({
      where: { task_type: "pickup", status: "available", driver_id: null, order: { outlet_id: outletId } },
      include: { order: { include: { customer: true, pickup_address: true } } },
      orderBy: { created_at: "asc" },
    });

    if (tasks.length > 0) return { tasks, next_release_at: null };

    const nextPending = await prisma.driverTask.findFirst({
      where: { task_type: "pickup", status: "pending", order: { outlet_id: outletId } },
      orderBy: { order: { pickup_schedule: "asc" } },
      select: { order: { select: { pickup_schedule: true } } },
    });

    const next_release_at = nextPending?.order?.pickup_schedule
      ? new Date(nextPending.order.pickup_schedule.getTime() - 60 * 60 * 1000).toISOString()
      : null;

    return { tasks, next_release_at };
  },

  async getAvailableDeliveryOrders(employeeId: string) {
    const outletId = await assertShiftEligibility(employeeId);
    const tasks = await prisma.driverTask.findMany({
      where: {
        task_type: "delivery",
        status: "available",
        driver_id: null,
        order: { status: "ready_for_delivery", outlet_id: outletId },
      },
      include: { order: { include: { customer: true, pickup_address: true } } },
    });
    return { tasks, next_release_at: null };
  },

  async getActiveTask(employeeId: string) {
    return prisma.driverTask.findFirst({
      where: { driver_id: employeeId, status: "in_progress" },
      select: DRIVER_TASK_DETAIL_SELECT,
    });
  },

  async assertDriverEligibility(employeeId: string) {
    const [outletId, hasActive] = await Promise.all([
      assertShiftEligibility(employeeId),
      hasActiveDriverTask(employeeId),
    ]);
    if (hasActive) throw new AppError("Anda sudah memiliki task aktif", 403);
    return { employeeOutletId: outletId };
  },

  async claimTask(employeeId: string, taskId: string) {
    const { employeeOutletId } = await this.assertDriverEligibility(employeeId);

    return prisma.$transaction(async (tx) => {
      const task = await tx.driverTask.findUnique({
        where: { id: taskId },
        select: { id: true, order_id: true, status: true, driver_id: true, order: { select: { outlet_id: true } } },
      });

      if (!task) throw new AppError("Task tidak ditemukan", 404);
      if (task.status !== "available") throw new AppError("Task tidak tersedia untuk diklaim", 409);
      if (task.driver_id !== null) throw new AppError("Task sudah diambil driver lain", 409);
      if (task.order.outlet_id !== employeeOutletId) throw new AppError("Task bukan dari outlet Anda", 403);

      const updateResult = await tx.driverTask.updateMany({
        where: { id: taskId, status: "available", driver_id: null },
        data: { driver_id: employeeId, status: "in_progress", taken_at: new Date() },
      });
      if (updateResult.count === 0) throw new AppError("Task sudah diambil driver lain", 409);

      const claimedTask = await tx.driverTask.findUnique({
        where: { id: taskId },
        select: DRIVER_TASK_DETAIL_SELECT,
      });

      if (claimedTask?.order.outlet_id) {
        emitToRoom(`outlet:${claimedTask.order.outlet_id}`, "driver:task-claimed", {
          taskId,
          driverId: employeeId,
          order_id: claimedTask.order_id,
        });
      }

      return claimedTask;
    });
  },

  async createDeliveryTask(orderId: string) {
    const existing = await prisma.driverTask.findUnique({
      where: { order_id_task_type: { order_id: orderId, task_type: "delivery" } },
    });
    if (existing) return existing;
    return prisma.driverTask.create({
      data: { order_id: orderId, task_type: "delivery", status: "available" },
    });
  },

  async completeTask(employeeId: string, taskId: string) {
    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance?.check_in_time) throw new AppError("Belum check-in", 403);
    if (todayAttendance.check_out_time) throw new AppError("Sudah check-out", 403);

    const task = await prisma.driverTask.findUnique({
      where: { id: taskId },
      include: { order: { select: { id: true, outlet_id: true, customer_id: true } } },
    });
    if (!task) throw new AppError("Task tidak ditemukan", 404);
    if (task.status !== "in_progress") throw new AppError("Task tidak sedang berlangsung", 400);
    if (task.driver_id !== employeeId) throw new AppError("Anda tidak terassign ke task ini", 403);

    const updatedTask = await prisma.driverTask.update({
      where: { id: taskId },
      data: { status: "completed", completed_at: new Date() },
    });

    const orderStatusMap: Record<string, OrderStatus> = {
      pickup: "laundry_to_outlet",
      delivery: "received_by_customer",
    };
    const newOrderStatus = orderStatusMap[task.task_type];
    if (!newOrderStatus) throw new AppError("Invalid task type", 400);

    const oldOrderStatus = task.task_type === "pickup" ? "waiting_pickup_driver" : "delivery_to_customer";

    await prisma.order.update({ where: { id: task.order_id }, data: { status: newOrderStatus } });
    await prisma.orderStatusHistory.create({
      data: {
        order_id: task.order_id,
        old_status: oldOrderStatus,
        new_status: newOrderStatus,
        changed_by_type: "employee",
        changed_by_id: employeeId,
        note: `Driver completed ${task.task_type} task`,
      },
    });

    if (task.order.outlet_id) {
      emitToRoom(`outlet:${task.order.outlet_id}`, "driver:task-completed", {
        taskId: task.id,
        taskType: task.task_type,
        orderId: task.order_id,
        driverId: employeeId,
        completedAt: new Date(),
      });
    }
    if (task.order.customer_id) {
      emitToUser(task.order.customer_id, "order:status-updated", {
        orderId: task.order_id,
        status: newOrderStatus,
      });
    }

    return updatedTask;
  },
};
