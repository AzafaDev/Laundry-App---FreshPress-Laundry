import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { OrderStatus, StationType } from "../../../generated/prisma/client.js";
import { getEmployeeOutlet } from "./attendance.utils.db.js";
import { assertShiftEligibility } from "./shift.guard.js";
import { driverService } from "./driver.service.js";

export const workerService = {
  async getStationOrders(employeeId: string, stationType: "washing" | "ironing" | "packing") {
    const outletId = await assertShiftEligibility(employeeId);

    const orders = await prisma.order.findMany({
      where: { status: stationType as OrderStatus, outlet_id: outletId },
      include: {
        customer: true,
        order_items: { include: { laundry_item: true } },
        order_item_breakdowns: { include: { clothing_type: true } },
        bypass_requests: {
          where: { station: stationType as StationType, status: "pending" },
          select: { id: true },
        },
      },
      orderBy: { created_at: "asc" },
    });
    return orders.map((o) => ({
      ...o,
      hasPendingBypass: o.bypass_requests.length > 0,
      bypass_requests: undefined,
    }));
  },

  async completeStation(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    actualItems?: { clothing_type_id: string; actual_quantity: number }[],
    checkPendingBypass = false,
  ) {
    const outletId = await assertShiftEligibility(employeeId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, customer: { select: { id: true, full_name: true } } },
    });
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.outlet_id !== outletId) throw new AppError("Order bukan dari outlet Anda", 403);
    if (order.status !== station) {
      throw new AppError(`Order sedang dalam status ${order.status}, tidak dapat diproses di station ${station}`, 400);
    }

    let finalStatus: OrderStatus;
    let shouldCreateDeliveryTask = false;

    if (station === "packing") {
      const isPaid = order.payment?.status === "paid";
      finalStatus = isPaid ? "ready_for_delivery" : "waiting_payment";
      shouldCreateDeliveryTask = isPaid;
    } else {
      const nextStatus: Record<string, OrderStatus> = { washing: "ironing", ironing: "packing" };
      finalStatus = nextStatus[station];
    }

    await prisma.$transaction(async (tx) => {
      if (checkPendingBypass) {
        const pendingBypass = await tx.bypassRequest.findFirst({
          where: { order_id: orderId, station: station as StationType, status: "pending" },
        });
        if (pendingBypass) throw new AppError("Terdapat BypassRequest pending untuk order ini, tunggu review admin", 409);
      }
      const updateResult = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status: finalStatus },
      });
      if (updateResult.count === 0) throw new AppError(`Station ${station} sudah diproses`, 409);
    });

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    await prisma.orderStatusHistory.create({
      data: {
        order_id: orderId,
        old_status: order.status,
        new_status: finalStatus,
        changed_by_type: "employee",
        changed_by_id: employeeId,
        note: `Station ${station} completed by worker`,
      },
    });

    await prisma.processLog.create({
      data: {
        order_id: orderId,
        station: station as StationType,
        employee_id: employeeId,
        input_items: actualItems ?? [],
        completed_at: new Date(),
      },
    });

    if (shouldCreateDeliveryTask) await driverService.createDeliveryTask(orderId);

    if (order.outlet_id) {
      emitToRoom(`outlet:${order.outlet_id}`, "station:order-completed", {
        orderId, station, newStatus: finalStatus, workerId: employeeId,
        outletId: order.outlet_id, timestamp: new Date(),
      });
      const nextStation = ({ washing: "ironing", ironing: "packing" } as Record<string, string>)[station];
      if (nextStation) {
        emitToRoom(`outlet:${order.outlet_id}`, "station:new-order", { station: nextStation, orderId });
      }
    }
    if (order.customer?.id) {
      emitToUser(order.customer.id, "order:status-updated", {
        orderId, status: finalStatus,
        message: `Order Anda telah melewati station ${station}`,
      });
    }

    return { order: updatedOrder, createdDeliveryTask: shouldCreateDeliveryTask };
  },

  async createBypassRequest(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    discrepancyDescription: string,
    actualItemsRaw: { clothing_type_id: string; actual_quantity: number }[],
    photoUrls: string[],
  ) {
    const [outletId, order] = await Promise.all([
      getEmployeeOutlet(employeeId),
      prisma.order.findUnique({ where: { id: orderId }, select: { outlet_id: true, status: true } }),
    ]);

    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.outlet_id !== outletId) throw new AppError("Order bukan dari outlet Anda", 403);
    if (order.status !== station) throw new AppError(`Order tidak sedang di station ${station}`, 400);

    const existing = await prisma.bypassRequest.findFirst({
      where: { order_id: orderId, station: station as StationType, status: "pending" },
    });
    if (existing) throw new AppError("Sudah ada bypass request pending untuk order ini, tunggu review admin", 409);

    const previousCount = await prisma.bypassRequest.count({
      where: { order_id: orderId, station: station as StationType, status: { not: "pending" } },
    });
    if (previousCount >= 2) throw new AppError("Bypass request sudah mencapai batas maksimal (2x) untuk station ini", 400);

    const breakdownItems = await prisma.orderItemBreakdown.findMany({
      where: { order_id: orderId },
      include: { clothing_type: true },
    });
    const clothingTypeMap = new Map(breakdownItems.map((i) => [i.clothing_type_id, i.clothing_type]));

    const bypass = await prisma.bypassRequest.create({
      data: {
        order_id: orderId,
        station: station as StationType,
        requested_by: employeeId,
        expected_items: breakdownItems.map((item) => ({
          clothing_type_id: item.clothing_type_id,
          name: item.clothing_type.name,
          quantity: item.quantity,
        })),
        actual_items: actualItemsRaw.map((a) => ({
          clothing_type_id: a.clothing_type_id,
          name: clothingTypeMap.get(a.clothing_type_id)?.name ?? "",
          actual_quantity: a.actual_quantity,
        })),
        discrepancy_description: discrepancyDescription,
        photo_evidence: photoUrls,
        attempt_number: previousCount + 1,
      },
    });

    emitToRoom(`outlet:${outletId}`, "bypass:created", { bypassId: bypass.id, orderId, station, workerId: employeeId });
    emitToUser(employeeId, "bypass:created", { bypassId: bypass.id, status: "pending" });

    return bypass;
  },

  async getOrderItemsForStation(orderId: string) {
    return prisma.orderItemBreakdown.findMany({
      where: { order_id: orderId },
      include: { clothing_type: true },
    });
  },

  async validateActualItems(orderId: string, actualItems: { clothing_type_id: string; actual_quantity: number }[]) {
    const breakdown = await this.getOrderItemsForStation(orderId);
    const discrepancies: { clothing_type_id: string; name: string; expected: number; actual: number }[] = [];

    for (const item of breakdown) {
      const submitted = actualItems.find((a) => a.clothing_type_id === item.clothing_type_id);
      const actual = submitted?.actual_quantity ?? 0;
      if (actual !== Number(item.quantity)) {
        discrepancies.push({ clothing_type_id: item.clothing_type_id, name: item.clothing_type.name, expected: Number(item.quantity), actual });
      }
    }

    return { isMatch: discrepancies.length === 0, discrepancies };
  },

  async submitItems(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    actualItems: { clothing_type_id: string; actual_quantity: number }[],
  ) {
    const { isMatch, discrepancies } = await this.validateActualItems(orderId, actualItems);
    if (!isMatch) return { success: false as const, requiresBypass: true, discrepancies };
    return this.completeStation(employeeId, station, orderId, actualItems, true);
  },
};
