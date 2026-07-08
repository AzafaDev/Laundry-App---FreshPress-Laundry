import { OrderStatus, Prisma } from "../../../generated/prisma/client.js";
import { emitToRoom, emitToUser } from "../../lib/socket.js";
import { notifyCustomer, notifyOutletAdmins } from "../../lib/notification.js";
import { sendPaymentReminderEmail } from "../../lib/email.js";

export type NormalizedItem = {
  item_type: "breakdown" | "satuan";
  item_id: string;
  name: string;
  quantity: number;
};

export type Discrepancy = {
  item_type: "breakdown" | "satuan";
  item_id: string;
  name: string;
  expected: number;
  actual: number;
};

export function resolveNextStatus(station: "washing" | "ironing" | "packing"): OrderStatus {
  const map: Record<string, OrderStatus> = { washing: "ironing", ironing: "packing", packing: "waiting_payment" };
  return map[station];
}

export function buildExpectedItems(
  breakdownItems: { clothing_type_id: string; clothing_type: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
  satuanOrderItems: { laundry_item_id: string; laundry_item: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
): NormalizedItem[] {
  return [
    ...breakdownItems.map((item) => ({
      item_type: "breakdown" as const,
      item_id: item.clothing_type_id,
      name: item.clothing_type.name,
      quantity: Number(item.quantity),
    })),
    ...satuanOrderItems.map((item) => ({
      item_type: "satuan" as const,
      item_id: item.laundry_item_id,
      name: item.laundry_item.name,
      quantity: Number(item.quantity),
    })),
  ];
}

export function buildActualItems(
  actualItemsRaw: { clothing_type_id: string; actual_quantity: number }[],
  actualSatuanItemsRaw: { laundry_item_id: string; actual_quantity: number }[],
  clothingTypeMap: Map<string, { name: string }>,
  satuanMap: Map<string, { name: string }>,
): NormalizedItem[] {
  return [
    ...actualItemsRaw.map((a) => ({
      item_type: "breakdown" as const,
      item_id: a.clothing_type_id,
      name: clothingTypeMap.get(a.clothing_type_id)?.name ?? "",
      quantity: a.actual_quantity,
    })),
    ...actualSatuanItemsRaw.map((a) => ({
      item_type: "satuan" as const,
      item_id: a.laundry_item_id,
      name: satuanMap.get(a.laundry_item_id)?.name ?? "",
      quantity: a.actual_quantity,
    })),
  ];
}

export async function emitStationEvents(
  order: {
    id: string;
    invoice_number: string;
    outlet_id: string | null;
    total_price: Prisma.Decimal | number | null;
    customer: { id: string; email: string; full_name: string } | null;
  },
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
    if (station === "packing") {
      const statusMsg = finalStatus === "waiting_payment"
        ? "Pesanan menunggu pembayaran dari customer."
        : "Pesanan siap untuk dikirim.";
      await notifyOutletAdmins(
        order.outlet_id,
        "Pengemasan Selesai",
        `Pesanan ${order.invoice_number} telah selesai dikemas. ${statusMsg}`,
        "order_update",
        order.id,
      );
    }
  }

  if (order.customer?.id) {
    emitToUser(order.customer.id, "order:status-updated", {
      orderId: order.id,
      status: finalStatus,
      ...(station === "packing" && { message: `Pesanan Anda telah selesai diproses` }),
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
        if (order.customer?.email) {
          await sendPaymentReminderEmail(
            order.customer.email,
            order.customer.full_name,
            order.invoice_number,
            Number(order.total_price ?? 0),
            order.id,
          );
        }
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

export function compareItems(
  breakdownItems: { clothing_type_id: string; clothing_type: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
  satuanOrderItems: { laundry_item_id: string; laundry_item: { name: string }; quantity: number | bigint | Prisma.Decimal }[],
  actualItems: { clothing_type_id: string; actual_quantity: number }[],
  actualSatuanItems: { laundry_item_id: string; actual_quantity: number }[],
): { isMatch: boolean; discrepancies: Discrepancy[] } {
  const discrepancies: Discrepancy[] = [];
  for (const item of breakdownItems) {
    const submitted = actualItems.find((a) => a.clothing_type_id === item.clothing_type_id);
    const actual = submitted?.actual_quantity ?? 0;
    if (actual !== Number(item.quantity)) {
      discrepancies.push({ item_type: "breakdown", item_id: item.clothing_type_id, name: item.clothing_type.name, expected: Number(item.quantity), actual });
    }
  }
  for (const item of satuanOrderItems) {
    const submitted = actualSatuanItems.find((a) => a.laundry_item_id === item.laundry_item_id);
    const actual = submitted?.actual_quantity ?? 0;
    if (actual !== Number(item.quantity)) {
      discrepancies.push({ item_type: "satuan", item_id: item.laundry_item_id, name: item.laundry_item.name, expected: Number(item.quantity), actual });
    }
  }
  return { isMatch: discrepancies.length === 0, discrepancies };
}
