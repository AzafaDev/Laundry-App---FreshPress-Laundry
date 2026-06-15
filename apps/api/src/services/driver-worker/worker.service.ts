import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { notifyCustomer } from "../../lib/notification.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { OrderStatus, StationType } from "../../../generated/prisma/client.js";
import { getEmployeeOutlet } from "../../repositories/driver-worker/attendance.repository.js";
import { assertShiftEligibility } from "../../guards/driver-worker/shift.guard.js";
import { driverService } from "./driver.service.js";
import {
  resolveNextStatus,
  buildExpectedItems,
  buildActualItems,
  compareItems,
} from "../../helpers/driver-worker/worker.helpers.js";

async function runCompleteStationTransaction(
  orderId: string,
  employeeId: string,
  station: "washing" | "ironing" | "packing",
  currentStatus: OrderStatus,
  finalStatus: OrderStatus,
  checkPendingBypass: boolean,
  actualItems?: { clothing_type_id: string; actual_quantity: number }[],
) {
  await prisma.$transaction(async (tx) => {
    if (checkPendingBypass) {
      const pendingBypass = await tx.bypassRequest.findFirst({
        where: { order_id: orderId, station: station as StationType, status: "pending" },
      });
      if (pendingBypass) throw new AppError("Terdapat BypassRequest pending untuk order ini, tunggu review admin", 409);
    }

    const updateResult = await tx.order.updateMany({
      where: { id: orderId, status: currentStatus },
      data: { status: finalStatus },
    });
    if (updateResult.count === 0) throw new AppError(`Station ${station} sudah diproses`, 409);

    await tx.orderStatusHistory.create({
      data: {
        order_id: orderId,
        old_status: currentStatus,
        new_status: finalStatus,
        changed_by_type: "employee",
        changed_by_id: employeeId,
        note: `Station ${station} completed by worker`,
      },
    });

    await tx.processLog.create({
      data: {
        order_id: orderId,
        station: station as StationType,
        employee_id: employeeId,
        input_items: actualItems ?? [],
        completed_at: new Date(),
      },
    });
  });
}

async function emitStationEvents(
  order: { id: string; invoice_number: string; outlet_id: string | null; customer: { id: string } | null },
  station: "washing" | "ironing" | "packing",
  finalStatus: OrderStatus,
  employeeId: string,
) {
  if (order.outlet_id) {
    emitToRoom(`outlet:${order.outlet_id}`, "station:order-completed", {
      orderId: order.id, station, newStatus: finalStatus, workerId: employeeId,
      outletId: order.outlet_id, timestamp: new Date(),
    });
    const nextStation = ({ washing: "ironing", ironing: "packing" } as Record<string, string>)[station];
    if (nextStation) {
      emitToRoom(`outlet:${order.outlet_id}`, "station:new-order", { station: nextStation, orderId: order.id });
    }
  }

  if (order.customer?.id) {
    emitToUser(order.customer.id, "order:status-updated", {
      orderId: order.id, status: finalStatus,
      message: `Order Anda telah melewati station ${station}`,
    });

    if (station === "packing") {
      if (finalStatus === "waiting_payment") {
        await notifyCustomer(
          order.customer.id,
          "Pembayaran Diperlukan",
          `Pesanan ${order.invoice_number} sudah selesai diproses. Silakan lakukan pembayaran.`,
          "order_update",
          order.id,
        );
      } else if (finalStatus === "ready_for_delivery") {
        await notifyCustomer(
          order.customer.id,
          "Pesanan Siap Dikirim",
          `Pesanan ${order.invoice_number} sudah selesai dan siap untuk dikirim.`,
          "order_update",
          order.id,
        );
      }
    }
  }
}

async function buildBypassData(
  orderId: string,
  actualItemsRaw: { clothing_type_id: string; actual_quantity: number }[],
  actualSatuanItemsRaw: { laundry_item_id: string; actual_quantity: number }[],
) {
  const [breakdownItems, satuanOrderItems] = await Promise.all([
    prisma.orderItemBreakdown.findMany({ where: { order_id: orderId }, include: { clothing_type: true } }),
    prisma.orderItem.findMany({
      where: { order_id: orderId, laundry_item: { unit: { not: "kg" } } },
      include: { laundry_item: { select: { id: true, name: true } } },
    }),
  ]);

  const clothingTypeMap = new Map(breakdownItems.map((i) => [i.clothing_type_id, i.clothing_type]));
  const satuanMap = new Map(satuanOrderItems.map((i) => [i.laundry_item_id, i.laundry_item]));

  return {
    expectedItems: buildExpectedItems(breakdownItems, satuanOrderItems),
    actualItems: buildActualItems(actualItemsRaw, actualSatuanItemsRaw, clothingTypeMap, satuanMap),
  };
}

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

    const isPaid = order.payment?.status === "paid";
    const finalStatus = resolveNextStatus(station, isPaid);
    const shouldCreateDeliveryTask = station === "packing" && isPaid;

    await runCompleteStationTransaction(orderId, employeeId, station, order.status, finalStatus, checkPendingBypass, actualItems);

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    if (shouldCreateDeliveryTask) await driverService.createDeliveryTask(orderId);

    await emitStationEvents(order, station, finalStatus, employeeId);

    return { order: updatedOrder, createdDeliveryTask: shouldCreateDeliveryTask };
  },

  async createBypassRequest(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    discrepancyDescription: string,
    actualItemsRaw: { clothing_type_id: string; actual_quantity: number }[],
    actualSatuanItemsRaw: { laundry_item_id: string; actual_quantity: number }[],
    photoUrls: string[],
  ) {
    const [outletId, order] = await Promise.all([
      assertShiftEligibility(employeeId),
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

    const { expectedItems, actualItems } = await buildBypassData(orderId, actualItemsRaw, actualSatuanItemsRaw);

    const bypass = await prisma.bypassRequest.create({
      data: {
        order_id: orderId,
        station: station as StationType,
        requested_by: employeeId,
        expected_items: expectedItems,
        actual_items: actualItems,
        discrepancy_description: discrepancyDescription,
        photo_evidence: photoUrls,
        attempt_number: previousCount + 1,
      },
    });

    emitToRoom(`outlet:${outletId}`, "bypass:created", { bypassId: bypass.id, orderId, station, workerId: employeeId });
    emitToUser(employeeId, "bypass:created", { bypassId: bypass.id, status: "pending" });

    return bypass;
  },

  // Called by admin bypass controller on approve — skips shift guard
  async completeStationAfterBypass(
    station: "washing" | "ironing" | "packing",
    orderId: string,
    workerId: string,
    actualItems: { clothing_type_id: string; actual_quantity: number }[],
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, customer: { select: { id: true, full_name: true } } },
    });
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.status !== station) {
      throw new AppError(`Order tidak sedang di station ${station}`, 400);
    }

    const isPaid = order.payment?.status === "paid";
    const finalStatus = resolveNextStatus(station, isPaid);
    const shouldCreateDeliveryTask = station === "packing" && isPaid;

    // checkPendingBypass = false karena bypass sudah di-approve, tidak perlu cek ulang
    await runCompleteStationTransaction(orderId, workerId, station, order.status, finalStatus, false, actualItems);

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    if (shouldCreateDeliveryTask) await driverService.createDeliveryTask(orderId);

    await emitStationEvents(order, station, finalStatus, workerId);

    return { order: updatedOrder, createdDeliveryTask: shouldCreateDeliveryTask };
  },

  async getOrderItemsForStation(orderId: string) {
    return prisma.orderItemBreakdown.findMany({
      where: { order_id: orderId },
      include: { clothing_type: true },
    });
  },

  async validateActualItems(
    orderId: string,
    actualItems: { clothing_type_id: string; actual_quantity: number }[],
    actualSatuanItems: { laundry_item_id: string; actual_quantity: number }[] = [],
  ) {
    const [breakdownItems, satuanOrderItems] = await Promise.all([
      this.getOrderItemsForStation(orderId),
      prisma.orderItem.findMany({
        where: { order_id: orderId, laundry_item: { unit: { not: "kg" } } },
        include: { laundry_item: { select: { id: true, name: true } } },
      }),
    ]);

    return compareItems(breakdownItems, satuanOrderItems, actualItems, actualSatuanItems);
  },

  async getBypassForOrder(employeeId: string, orderId: string) {
    const outletId = await getEmployeeOutlet(employeeId);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { outlet_id: true },
    });
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.outlet_id !== outletId) throw new AppError("Order bukan dari outlet Anda", 403);

    return prisma.bypassRequest.findFirst({
      where: { order_id: orderId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        status: true,
        station: true,
        expected_items: true,
        actual_items: true,
        discrepancy_description: true,
        photo_evidence: true,
        attempt_number: true,
        created_at: true,
      },
    });
  },

  async submitItems(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    actualItems: { clothing_type_id: string; actual_quantity: number }[],
    actualSatuanItems: { laundry_item_id: string; actual_quantity: number }[] = [],
  ) {
    const { isMatch, discrepancies } = await this.validateActualItems(orderId, actualItems, actualSatuanItems);
    if (!isMatch) return { success: false as const, requiresBypass: true, discrepancies };
    return this.completeStation(employeeId, station, orderId, actualItems, true);
  },
};
