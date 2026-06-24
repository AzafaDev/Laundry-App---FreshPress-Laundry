import { prisma } from "../../lib/prisma.js";
import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { notifyOutletAdmins, notifyOutletEmployees } from "../../lib/notification.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { OrderStatus, StationType } from "../../../generated/prisma/client.js";
import { getEmployeeOutlet } from "../../repositories/driver-worker/attendance.repository.js";
import { runCompleteStationTransaction } from "../../repositories/driver-worker/worker.repository.js";
import { assertShiftEligibility } from "../../guards/driver-worker/shift.guard.js";
import {
  resolveNextStatus,
  buildExpectedItems,
  buildActualItems,
  compareItems,
  emitStationEvents,
} from "../../helpers/driver-worker/worker.helpers.js";

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
          where: { station: stationType as StationType },
          select: { status: true, admin_notes: true },
          orderBy: { created_at: "desc" as const },
          take: 1,
        },
      },
      orderBy: { created_at: "asc" },
      take: 200,
    });
    return orders.map((o) => ({
      ...o,
      bypassStatus: o.bypass_requests[0]?.status ?? null,
      bypassAdminNotes: o.bypass_requests[0]?.admin_notes ?? null,
      bypass_requests: undefined,
    }));
  },

  async completeStation(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    orderId: string,
    actualItems?: { clothing_type_id: string; actual_quantity: number }[],
    checkPendingBypass = true,
  ) {
    const outletId = await assertShiftEligibility(employeeId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { select: { id: true, full_name: true, email: true } } },
    });
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.outlet_id !== outletId) throw new AppError("Order bukan dari outlet Anda", 403);
    if (order.status !== station) {
      throw new AppError(`Order sedang dalam status ${order.status}, tidak dapat diproses di station ${station}`, 400);
    }

    let finalStatus = resolveNextStatus(station);
    if (station === "packing") {
      const payment = await prisma.payment.findUnique({ where: { order_id: orderId }, select: { status: true } });
      if (payment?.status === "paid") finalStatus = "ready_for_delivery";
    }

    await runCompleteStationTransaction(orderId, employeeId, station, order.status, finalStatus, checkPendingBypass, actualItems);

    if (finalStatus === "ready_for_delivery") {
      await prisma.driverTask.upsert({
        where: { order_id_task_type: { order_id: orderId, task_type: "delivery" } },
        create: { order_id: orderId, task_type: "delivery", status: "available" },
        update: {},
      });
      if (order.outlet_id) {
        emitToRoom(`outlet:${order.outlet_id}`, "order:payment-completed", {
          orderId: order.id,
          invoiceNumber: order.invoice_number,
          timestamp: new Date(),
        });
        await notifyOutletEmployees(
          order.outlet_id,
          ["outlet_admin", "driver"],
          "Pembayaran berhasil",
          `Pesanan ${order.invoice_number} siap untuk diantar.`,
          "payment_completed",
          order.id,
        );
      }
    }

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    await emitStationEvents(order, station, finalStatus, employeeId);

    return { order: updatedOrder };
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
      prisma.order.findUnique({ where: { id: orderId }, select: { outlet_id: true, status: true, invoice_number: true } }),
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

    await notifyOutletAdmins(
      outletId,
      "Bypass Request Baru",
      `Worker mengajukan bypass di station ${station} untuk order #${order.invoice_number}`,
      "bypass_request",
      bypass.id,
    );

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
    bypassRequestId: string,
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { select: { id: true, full_name: true, email: true } } },
    });
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.status !== station) {
      throw new AppError(`Order tidak sedang di station ${station}`, 400);
    }

    let finalStatus = resolveNextStatus(station);
    if (station === "packing") {
      const payment = await prisma.payment.findUnique({ where: { order_id: orderId }, select: { status: true } });
      if (payment?.status === "paid") finalStatus = "ready_for_delivery";
    }

    // checkPendingBypass = false karena bypass sudah di-approve, tidak perlu cek ulang
    await runCompleteStationTransaction(orderId, workerId, station, order.status, finalStatus, false, actualItems, bypassRequestId);

    if (finalStatus === "ready_for_delivery") {
      await prisma.driverTask.upsert({
        where: { order_id_task_type: { order_id: orderId, task_type: "delivery" } },
        create: { order_id: orderId, task_type: "delivery", status: "available" },
        update: {},
      });
      if (order.outlet_id) {
        emitToRoom(`outlet:${order.outlet_id}`, "order:payment-completed", {
          orderId: order.id,
          invoiceNumber: order.invoice_number,
          timestamp: new Date(),
        });
        await notifyOutletEmployees(
          order.outlet_id,
          ["outlet_admin", "driver"],
          "Pembayaran berhasil",
          `Pesanan ${order.invoice_number} siap untuk diantar.`,
          "payment_completed",
          order.id,
        );
      }
    }

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    await emitStationEvents(order, station, finalStatus, workerId);

    return { order: updatedOrder };
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

  async getTaskHistory(
    employeeId: string,
    station: "washing" | "ironing" | "packing",
    outletId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      employee_id: employeeId,
      station: station as StationType,
      completed_at: { not: null as null },
      order: { outlet_id: outletId },
    };
    const [tasks, total] = await Promise.all([
      prisma.processLog.findMany({
        where,
        select: {
          id: true,
          station: true,
          is_bypassed: true,
          started_at: true,
          completed_at: true,
          notes: true,
          order: {
            select: {
              id: true,
              invoice_number: true,
              customer: { select: { full_name: true } },
            },
          },
        },
        orderBy: { completed_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.processLog.count({ where }),
    ]);
    return { tasks, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  },
};
