import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { snap, coreApi } from "../../lib/payment.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { resolvePaymentStatus, applyPaymentStatus } from "./payment.helpers.js";

export const createPaymentTransaction = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customer_id: customerId, deleted_at: null },
    include: { customer: { select: { full_name: true, email: true, phone: true } }, payment: true },
  });
  if (!order) throw new AppError("Order tidak ditemukan.", 404);
  if (!order.total_price) throw new AppError("Total harga order belum tersedia.", 400);
  if (order.payment?.status === "paid") throw new AppError("Order ini sudah dibayar.", 400);

  const grossAmount = Math.round(Number(order.total_price));
  const midtransOrderId = `${order.invoice_number}-${Date.now()}`;
  const [firstName, ...rest] = order.customer.full_name.trim().split(/\s+/);

  const transaction = await snap.createTransaction({
    transaction_details: { order_id: midtransOrderId, gross_amount: grossAmount },
    customer_details: { first_name: firstName || order.customer.full_name, last_name: rest.join(" ") || undefined, email: order.customer.email, phone: order.customer.phone ?? undefined },
    item_details: [{ id: order.id, price: grossAmount, quantity: 1, name: `Pembayaran Laundry ${order.invoice_number}`.slice(0, 50) }],
    callbacks: { finish: `${process.env.CLIENT_URL}/customer/orders` },
  });

  const payment = await prisma.payment.upsert({
    where: { order_id: order.id },
    update: { amount: grossAmount, gateway_name: "midtrans", gateway_transaction_id: midtransOrderId, payment_link: transaction.redirect_url, status: "pending" },
    create: { order_id: order.id, amount: grossAmount, payment_method: "gateway", gateway_name: "midtrans", gateway_transaction_id: midtransOrderId, payment_link: transaction.redirect_url, status: "pending" },
  });
  return { token: transaction.token, redirect_url: transaction.redirect_url, payment };
};

export const getPaymentStatus = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, customer_id: customerId, deleted_at: null }, include: { payment: true } });
  if (!order) throw new AppError("Order tidak ditemukan.", 404);
  return order.payment;
};

export const handlePaymentNotification = async (payload: Record<string, any>) => {
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = payload;

  const expectedSignature = crypto.createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest("hex");
  if (signature_key !== expectedSignature) throw new AppError("Signature tidak valid.", 403);

  const payment = await prisma.payment.findFirst({ where: { gateway_transaction_id: order_id } });
  if (!payment) throw new AppError("Payment tidak ditemukan.", 404);

  const newStatus = resolvePaymentStatus(payment.status, transaction_status, fraud_status);
  await applyPaymentStatus(payment, newStatus, payload);
  return { status: newStatus };
};

export const syncPaymentStatus = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({ where: { id: orderId, customer_id: customerId, deleted_at: null }, include: { payment: true } });
  if (!order) throw new AppError("Order tidak ditemukan.", 404);

  const payment = order.payment;
  if (!payment?.gateway_transaction_id) throw new AppError("Transaksi pembayaran belum dibuat.", 400);
  if (payment.status === "paid") return payment;

  const result = await coreApi.transaction.status(payment.gateway_transaction_id);
  const { transaction_status, fraud_status } = result as { transaction_status: string; fraud_status?: string };

  const newStatus = resolvePaymentStatus(payment.status, transaction_status, fraud_status);
  await applyPaymentStatus(payment, newStatus, result);
  return prisma.payment.findUnique({ where: { id: payment.id } });
};
