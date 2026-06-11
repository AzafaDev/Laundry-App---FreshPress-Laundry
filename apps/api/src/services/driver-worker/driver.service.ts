import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { notifyCustomer } from "../../lib/notification.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { Prisma, OrderStatus } from "../../../generated/prisma/client.js";
import { hasActiveDriverTask } from "./attendance.utils.db.js";
import { attendanceService } from "./attendance.service.js";
import { assertShiftEligibility } from "./shift.guard.js";

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
      customer_id: true,
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

    return { tasks };
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
    return { tasks };
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
    const [{ employeeOutletId }, employee] = await Promise.all([
      this.assertDriverEligibility(employeeId),
      prisma.employee.findUnique({ where: { id: employeeId }, select: { full_name: true } }),
    ]);
    const driverName = employee?.full_name ?? "Driver";

    const claimedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.driverTask.findUnique({
        where: { id: taskId },
        select: { id: true, order_id: true, task_type: true, status: true, driver_id: true, order: { select: { outlet_id: true } } },
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

      const claimStatusMap: Record<string, OrderStatus> = {
        pickup: "laundry_to_outlet",
        delivery: "delivery_to_customer",
      };
      const claimOldStatusMap: Record<string, OrderStatus> = {
        pickup: "waiting_pickup_driver",
        delivery: "ready_for_delivery",
      };
      const now = new Date();
      await tx.order.update({
        where: { id: task.order_id },
        data: {
          status: claimStatusMap[task.task_type],
          ...(task.task_type === "pickup" ? { pickup_schedule: now } : {}),
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          order_id: task.order_id,
          old_status: claimOldStatusMap[task.task_type],
          new_status: claimStatusMap[task.task_type],
          changed_by_type: "employee",
          changed_by_id: employeeId,
          note: `Driver claimed ${task.task_type} task`,
        },
      });

      if (claimedTask?.order.outlet_id) {
        emitToRoom(`outlet:${claimedTask.order.outlet_id}`, "driver:task-claimed", {
          taskId,
          driverId: employeeId,
          order_id: claimedTask.order_id,
        });
      }

      if (claimedTask?.order.customer_id) {
        if (claimedTask.task_type === "pickup") {
          await notifyCustomer(
            claimedTask.order.customer_id,
            "Driver dalam perjalanan",
            `Driver ${driverName} sedang menuju lokasi penjemputan untuk pesanan ${claimedTask.order.invoice_number}.`,
            "driver_pickup_started",
            claimedTask.order_id,
          );
        } else if (claimedTask.task_type === "delivery") {
          await notifyCustomer(
            claimedTask.order.customer_id,
            "Driver dalam perjalanan",
            `Driver ${driverName} sedang mengantarkan pesanan ${claimedTask.order.invoice_number} ke lokasi Anda.`,
            "driver_delivery_started",
            claimedTask.order_id,
          );
        }
      }

      return claimedTask;
    });

    if (claimedTask?.order.customer_id) {
      const notifContent = claimedTask.task_type === "pickup"
        ? { title: "Driver menuju lokasi Anda", body: `Driver ${driverName} sedang dalam perjalanan untuk mengambil laundry Anda.` }
        : { title: "Driver mengantarkan laundry Anda", body: `Driver ${driverName} sedang dalam perjalanan mengantar laundry Anda.` };

      await prisma.notification.create({
        data: {
          user_type: "customer",
          user_id: claimedTask.order.customer_id,
          title: notifContent.title,
          body: notifContent.body,
          type: "driver_update",
          related_entity_id: claimedTask.order_id,
        },
      });
      emitToUser(claimedTask.order.customer_id, "notification:new", {
        title: notifContent.title,
        body: notifContent.body,
        orderId: claimedTask.order_id,
      });
    }

    return claimedTask;
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
      pickup: "laundry_arrived_outlet",
      delivery: "received_by_customer",
    };
    const newOrderStatus = orderStatusMap[task.task_type];
    if (!newOrderStatus) throw new AppError("Invalid task type", 400);

    const oldOrderStatus = task.task_type === "pickup" ? "laundry_to_outlet" : "delivery_to_customer";

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

      if (task.task_type === "pickup") {
        await notifyCustomer(
          task.order.customer_id,
          "Driver telah tiba di outlet",
          "Laundry Anda telah tiba di outlet dan akan segera diproses.",
          "driver_arrived_outlet",
          task.order_id,
        );
      } else if (task.task_type === "delivery") {
        await notifyCustomer(
          task.order.customer_id,
          "Driver telah tiba",
          "Driver telah tiba di lokasi Anda dengan pesanan laundry Anda.",
          "driver_arrived_customer",
          task.order_id,
        );
      }
      const completeNotifContent = task.task_type === "pickup"
        ? { title: "Laundry tiba di outlet", body: "Laundry Anda telah tiba di outlet dan siap diproses." }
        : { title: "Laundry telah diterima", body: "Laundry Anda telah diterima. Terima kasih!" };

      await prisma.notification.create({
        data: {
          user_type: "customer",
          user_id: task.order.customer_id,
          title: completeNotifContent.title,
          body: completeNotifContent.body,
          type: "driver_update",
          related_entity_id: task.order_id,
        },
      });
      emitToUser(task.order.customer_id, "notification:new", {
        title: completeNotifContent.title,
        body: completeNotifContent.body,
        orderId: task.order_id,
      });
    }

    return updatedTask;
  },
};
