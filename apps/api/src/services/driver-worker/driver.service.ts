import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { notifyCustomer } from "../../lib/notification.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { Prisma, OrderStatus } from "../../../generated/prisma/client.js";
import { calcEtaText } from "../../utils/distance.util.js";
import { attendanceService } from "./attendance.service.js";
import { assertShiftEligibility, assertDriverEligibility } from "../../guards/driver-worker/shift.guard.js";

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
      outlet: { select: { latitude: true, longitude: true } },
      notes: true,
    },
  },
} satisfies Prisma.DriverTaskSelect;

type DriverTaskDetail = Prisma.DriverTaskGetPayload<{ select: typeof DRIVER_TASK_DETAIL_SELECT }>;


async function runClaimTransaction(taskId: string, employeeId: string, employeeOutletId: string): Promise<DriverTaskDetail> {
  return prisma.$transaction(async (tx) => {
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

    return tx.driverTask.findUniqueOrThrow({
      where: { id: taskId },
      select: DRIVER_TASK_DETAIL_SELECT,
    });
  });
}

async function emitClaimEvents(task: DriverTaskDetail, employeeId: string, driverName: string) {
  emitToRoom(`outlet:${task.order.outlet_id}`, "driver:task-claimed", {
    taskId: task.id,
    driverId: employeeId,
    order_id: task.order_id,
    task_type: task.task_type,
  });

  const outlet = task.order.outlet;
  const addr = task.order.pickup_address;
  const etaText =
    outlet?.latitude && outlet?.longitude && addr?.latitude && addr?.longitude
      ? calcEtaText(Number(outlet.latitude), Number(outlet.longitude), Number(addr.latitude), Number(addr.longitude))
      : null;
  const etaSuffix = etaText ? `, estimasi ${etaText}` : "";

  if (task.task_type === "pickup") {
    await notifyCustomer(
      task.order.customer_id,
      "Driver dalam perjalanan",
      `Driver ${driverName} sedang menuju lokasi penjemputan${etaSuffix} untuk pesanan ${task.order.invoice_number}.`,
      "driver_pickup_started",
      task.order_id,
    );
  } else if (task.task_type === "delivery") {
    await notifyCustomer(
      task.order.customer_id,
      "Driver dalam perjalanan",
      `Driver ${driverName} sedang mengantarkan pesanan ${task.order.invoice_number} ke lokasi Anda${etaSuffix}.`,
      "driver_delivery_started",
      task.order_id,
    );
  }
}

async function runCompleteTransaction(
  task: { id: string; order_id: string; task_type: string; driver_id: string | null; order: { status: OrderStatus } },
  taskId: string,
  employeeId: string,
) {
  const orderStatusMap: Record<string, OrderStatus> = {
    pickup: "laundry_arrived_outlet",
    delivery: "received_by_customer",
  };
  const newOrderStatus = orderStatusMap[task.task_type];
  if (!newOrderStatus) throw new AppError("Invalid task type", 400);

  const oldOrderStatus: OrderStatus = task.task_type === "pickup" ? "laundry_to_outlet" : "delivery_to_customer";

  if (task.order.status !== oldOrderStatus) {
    throw new AppError("Status order tidak sesuai untuk diselesaikan", 409);
  }

  return prisma.$transaction(async (tx) => {
    const taskUpdate = await tx.driverTask.updateMany({
      where: { id: taskId, status: "in_progress", driver_id: employeeId },
      data: { status: "completed", completed_at: new Date() },
    });
    if (taskUpdate.count === 0) throw new AppError("Task sudah diselesaikan atau tidak valid", 409);

    const orderUpdate = await tx.order.updateMany({
      where: { id: task.order_id, status: oldOrderStatus },
      data: {
        status: newOrderStatus,
        ...(newOrderStatus === "received_by_customer" && {
          auto_confirm_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
        }),
      },
    });
    if (orderUpdate.count === 0) throw new AppError("Status order tidak sesuai untuk diselesaikan", 409);

    await tx.orderStatusHistory.create({
      data: {
        order_id: task.order_id,
        old_status: oldOrderStatus,
        new_status: newOrderStatus,
        changed_by_type: "employee",
        changed_by_id: employeeId,
        note: `Driver completed ${task.task_type} task`,
      },
    });

    return { updatedTask: await tx.driverTask.findUniqueOrThrow({ where: { id: taskId } }), newOrderStatus };
  });
}

async function emitCompleteEvents(
  task: { id: string; order_id: string; task_type: string; order: { outlet_id: string; customer_id: string } },
  employeeId: string,
  newOrderStatus: OrderStatus,
) {
  emitToRoom(`outlet:${task.order.outlet_id}`, "driver:task-completed", {
    taskId: task.id,
    taskType: task.task_type,
    orderId: task.order_id,
    driverId: employeeId,
    completedAt: new Date(),
  });

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
}

export const driverService = {
  async getAvailablePickupOrders(employeeId: string) {
    const outletId = await assertShiftEligibility(employeeId);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const tasks = await prisma.driverTask.findMany({
      where: {
        task_type: "pickup",
        status: "available",
        driver_id: null,
        order: {
          outlet_id: outletId,
          pickup_date: { lte: endOfToday },
        },
      },
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

  async claimTask(employeeId: string, taskId: string) {
    const [{ employeeOutletId }, employee] = await Promise.all([
      assertDriverEligibility(employeeId),
      prisma.employee.findUnique({ where: { id: employeeId }, select: { full_name: true } }),
    ]);
    const driverName = employee?.full_name ?? "Driver";
    const claimed = await runClaimTransaction(taskId, employeeId, employeeOutletId);
    await emitClaimEvents(claimed, employeeId, driverName);
    return claimed;
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

  async getTaskHistory(employeeId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { driver_id: employeeId, status: "completed" as const };
    const [tasks, total] = await Promise.all([
      prisma.driverTask.findMany({
        where,
        select: {
          id: true,
          task_type: true,
          status: true,
          taken_at: true,
          completed_at: true,
          order: {
            select: {
              id: true,
              invoice_number: true,
              customer: { select: { full_name: true, phone: true } },
              pickup_address: { select: { address: true } },
            },
          },
        },
        orderBy: { completed_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.driverTask.count({ where }),
    ]);
    return { tasks, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  },

  async completeTask(employeeId: string, taskId: string) {
    const todayAttendance = await attendanceService.checkTodayAttendance(employeeId);
    if (!todayAttendance?.check_in_time) throw new AppError("Belum check-in", 403);
    if (todayAttendance.check_out_time) throw new AppError("Sudah check-out", 403);

    const task = await prisma.driverTask.findUnique({
      where: { id: taskId },
      include: { order: { select: { id: true, outlet_id: true, customer_id: true, status: true } } },
    });
    if (!task) throw new AppError("Task tidak ditemukan", 404);
    if (task.status !== "in_progress") throw new AppError("Task tidak sedang berlangsung", 400);
    if (task.driver_id !== employeeId) throw new AppError("Anda tidak terassign ke task ini", 403);

    const { updatedTask, newOrderStatus } = await runCompleteTransaction(task, taskId, employeeId);
    await emitCompleteEvents(task, employeeId, newOrderStatus);
    return updatedTask;
  },
};
