import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { Prisma, OrderStatus } from "../../../generated/prisma/client.js";

export const DRIVER_TASK_DETAIL_SELECT = {
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

export type DriverTaskDetail = Prisma.DriverTaskGetPayload<{ select: typeof DRIVER_TASK_DETAIL_SELECT }>;

export async function runClaimTransaction(taskId: string, employeeId: string, employeeOutletId: string): Promise<DriverTaskDetail> {
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

export async function runCompleteTransaction(
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
