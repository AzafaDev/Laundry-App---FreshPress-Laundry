import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { notifyCustomer } from "../../lib/notification.js";

// Re-export from split files so controllers' namespace imports still work
export { createCustomerOrder } from "./order.create.service.js";
export { createCustomerComplaint, type CreateComplaintInput } from "./order.complaint.service.js";
export type { CreateCustomerOrderInput } from "./order.helpers.js";

export interface ListCustomerOrdersOptions {
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export const listCustomerOrders = async (customerId: string, options: ListCustomerOrdersOptions = {}) => {
  const { status, search, date_from, date_to, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  type OrderWhere = NonNullable<Parameters<typeof prisma.order.findMany>[0]>["where"];
  const where: OrderWhere = { customer_id: customerId, deleted_at: null };

  if (status) where.status = status as never;
  if (search) where.invoice_number = { contains: search, mode: "insensitive" };
  if (date_from || date_to) {
    const range: Record<string, Date> = {};
    if (date_from) range.gte = new Date(`${date_from}T00:00:00`);
    if (date_to) range.lte = new Date(`${date_to}T23:59:59`);
    where.created_at = range as never;
  }

  const include = {
    outlet: { select: { id: true, name: true, city: true, phone: true } },
    status_histories: { orderBy: { created_at: "desc" as const }, take: 20 },
    payment: { select: { status: true, amount: true, paid_at: true } },
    order_items: { include: { laundry_item: { select: { id: true, name: true, unit: true } } } },
    complaints: { select: { id: true, status: true, resolution_notes: true } },
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take: limit, orderBy: { created_at: "desc" }, include }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const completeCustomerOrder = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customer_id: customerId, deleted_at: null },
  });
  if (!order) throw new AppError("Order tidak ditemukan.", 404);
  if (order.status !== "received_by_customer") throw new AppError("Order belum bisa diselesaikan.", 400);

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "completed" } }),
    prisma.orderStatusHistory.create({
      data: { order_id: order.id, old_status: "received_by_customer", new_status: "completed", changed_by_type: "customer", changed_by_id: customerId, note: "Customer mengonfirmasi pesanan telah selesai." },
    }),
  ]);

  await notifyCustomer(customerId, "Pesanan selesai",
    `Pesanan ${order.invoice_number} telah selesai. Terima kasih telah menggunakan layanan kami.`, "order_completed", order.id);

  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      outlet: { select: { id: true, name: true, city: true } },
      status_histories: { orderBy: { created_at: "desc" }, take: 20 },
      payment: { select: { status: true, amount: true, paid_at: true } },
      order_items: { include: { laundry_item: { select: { id: true, name: true, unit: true } } } },
    },
  });
};

export const getCustomerOrderById = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customer_id: customerId, deleted_at: null },
    include: {
      outlet: { select: { id: true, name: true, city: true, address: true } },
      pickup_address: { select: { id: true, label: true, address: true, city: true, district: true, province: true, postal_code: true } },
      status_histories: { orderBy: { created_at: "desc" }, take: 50 },
      payment: true,
      order_items: { include: { laundry_item: { select: { id: true, name: true, unit: true } } } },
    },
  });
  if (!order) throw new AppError("Order tidak ditemukan.", 404);
  return order;
};
