import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { assertShiftEligibility, assertDriverEligibility } from "../../guards/driver-worker/shift.guard.js";
import { getNow, toWIBView, wibTimeOnDate } from "../../utils/time.util.js";
import {
  DRIVER_TASK_DETAIL_SELECT,
  runClaimTransaction,
  runCompleteTransaction,
} from "../../repositories/driver-worker/driver.repository.js";
import { emitClaimEvents, emitCompleteEvents } from "../../helpers/driver-worker/driver.helpers.js";

export const driverService = {
  async getAvailablePickupOrders(employeeId: string) {
    const outletId = await assertShiftEligibility(employeeId);
    const endOfToday = wibTimeOnDate(toWIBView(getNow()), 23, 59, 59);
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
      take: 200,
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
      orderBy: { created_at: "asc" },
      take: 200,
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
    await assertShiftEligibility(employeeId);

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
