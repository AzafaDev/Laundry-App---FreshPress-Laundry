import { prisma } from "../../lib/prisma.js";
import { notifyCustomer, notifyOutletEmployees } from "../../lib/notification.js";
import { emitToRoom } from "../../lib/socket.js";
import type { Payment, PaymentStatus } from "../../../generated/prisma/client.js";

const SETTLED_STATUSES = new Set(["capture", "settlement"]);
const FAILED_STATUSES = new Set(["deny", "cancel", "failure"]);

export function resolvePaymentStatus(currentStatus: PaymentStatus, transactionStatus: string, fraudStatus?: string): PaymentStatus {
  if (SETTLED_STATUSES.has(transactionStatus)) {
    return transactionStatus === "capture" && fraudStatus !== "accept" ? "pending" : "paid";
  }
  if (transactionStatus === "expire") return "expired";
  if (FAILED_STATUSES.has(transactionStatus)) return "failed";
  if (transactionStatus === "pending") return "pending";
  return currentStatus;
}

export async function applyPaymentStatus(payment: Payment, newStatus: PaymentStatus, payload: Record<string, unknown>) {
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: newStatus, gateway_response: payload as never, paid_at: newStatus === "paid" ? new Date() : payment.paid_at },
  });

  if (newStatus === "paid") {
    const order = await prisma.order.findUnique({ where: { id: payment.order_id } });

    if (order?.status === "waiting_payment") {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { status: "ready_for_delivery" } }),
        prisma.orderStatusHistory.create({
          data: { order_id: order.id, old_status: "waiting_payment", new_status: "ready_for_delivery", changed_by_type: "system", note: "Pembayaran berhasil melalui Midtrans." },
        }),
        prisma.driverTask.create({ data: { order_id: order.id, task_type: "delivery", status: "available" } }),
      ]);

      if (order.outlet_id) {
        await notifyOutletEmployees(order.outlet_id, ["outlet_admin", "driver"], "Pembayaran berhasil", `Pesanan ${order.invoice_number} telah dibayar oleh customer.`, "payment_completed", order.id);
      }
    }

    if (order) {
      if (order.outlet_id) {
        emitToRoom(`outlet:${order.outlet_id}`, "order:payment-completed", { orderId: order.id, invoiceNumber: order.invoice_number, timestamp: new Date() });
      }
      await notifyCustomer(order.customer_id, "Pembayaran berhasil", `Pembayaran untuk pesanan ${order.invoice_number} telah berhasil dikonfirmasi.`, "payment", order.id);
    }
  }
}
