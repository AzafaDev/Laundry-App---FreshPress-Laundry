import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { notifyOutletEmployees } from "../../lib/notification.js";
import { emitToRoom } from "../../lib/socket.js";

export interface CreateComplaintInput {
  complaint_type: string;
  description: string;
  photo_urls?: string[];
}

export const createCustomerComplaint = async (customerId: string, orderId: string, input: CreateComplaintInput) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customer_id: customerId, deleted_at: null },
    include: { customer: { select: { full_name: true } } },
  });
  if (!order) throw new AppError("Order tidak ditemukan.", 404);
  if (order.status !== "received_by_customer") {
    throw new AppError("Komplain hanya bisa diajukan untuk pesanan yang sudah diterima.", 400);
  }

  const existingComplaint = await prisma.complaint.findFirst({ where: { order_id: orderId } });
  if (existingComplaint) throw new AppError("Komplain untuk pesanan ini sudah pernah diajukan.", 400);

  const complaint = await prisma.complaint.create({
    data: {
      order_id: order.id,
      customer_id: customerId,
      complaint_type: input.complaint_type,
      description: input.description,
      photo_urls: input.photo_urls ?? [],
    },
  });

  if (order.outlet_id) {
    emitToRoom(`outlet:${order.outlet_id}`, "order:complaint-submitted", {
      orderId: order.id, invoiceNumber: order.invoice_number,
      customerName: order.customer?.full_name, complaintType: complaint.complaint_type, timestamp: new Date(),
    });
    await notifyOutletEmployees(order.outlet_id, ["outlet_admin"], "Komplain baru",
      `${order.customer?.full_name ?? "Customer"} mengajukan komplain untuk pesanan ${order.invoice_number}`,
      "complaint_submitted", order.id);
  }
  return complaint;
};
