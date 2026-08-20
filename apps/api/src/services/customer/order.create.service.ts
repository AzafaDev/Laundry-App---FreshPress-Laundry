import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { notifyOutletEmployees } from "../../lib/notification.js";
import { emitToRoom } from "../../lib/socket.js";
import {
  haversineKm,
  generateInvoiceNumber,
  calculateDeliveryFee,
  type CreateCustomerOrderInput,
} from "./order.helpers.js";

export const createCustomerOrder = async (customerId: string, input: CreateCustomerOrderInput) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { is_verified: true },
  });
  if (!customer?.is_verified) {
    throw new AppError("Akun belum terverifikasi. Silakan verifikasi email terlebih dahulu.", 403);
  }

  const pickupAddress = await prisma.customerAddress.findFirst({
    where: { id: input.pickup_address_id, customer_id: customerId },
    select: { id: true, latitude: true, longitude: true },
  });
  if (!pickupAddress) throw new AppError("Alamat pickup tidak ditemukan.", 404);

  const outlets = await prisma.outlet.findMany({
    where: { is_active: true, deleted_at: null },
    select: { id: true, latitude: true, longitude: true, service_radius_km: true },
  });
  if (outlets.length === 0) throw new AppError("Tidak ada outlet aktif.", 404);

  const nearestOutlet = outlets
    .map((outlet) => ({
      id: outlet.id,
      distance: haversineKm(Number(pickupAddress.latitude), Number(pickupAddress.longitude), Number(outlet.latitude), Number(outlet.longitude)),
      service_radius_km: Number(outlet.service_radius_km),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearestOutlet) throw new AppError("Tidak ada outlet aktif.", 404);

  const pickupDate = new Date(`${input.pickup_date}T00:00:00.000Z`);
  if (Number.isNaN(pickupDate.getTime())) throw new AppError("Tanggal pickup tidak valid.", 400);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (pickupDate < todayStart) throw new AppError("Jadwal pickup tidak boleh di masa lalu.", 400);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  maxDate.setHours(23, 59, 59, 999);
  if (pickupDate > maxDate) throw new AppError("Jadwal pickup maksimal 7 hari ke depan.", 400);

  const invoiceNumber = generateInvoiceNumber();

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        outlet_id: nearestOutlet.id,
        pickup_address_id: input.pickup_address_id,
        status: "waiting_pickup_driver",
        pickup_date: pickupDate,
        total_weight_kg: 0,
        delivery_fee: calculateDeliveryFee(nearestOutlet.distance),
        total_price: 0,
      },
    });
    await tx.orderStatusHistory.create({
      data: { order_id: createdOrder.id, old_status: null, new_status: "waiting_pickup_driver", changed_by_type: "customer", changed_by_id: customerId, note: "Customer membuat permintaan pickup." },
    });
    await tx.driverTask.create({ data: { order_id: createdOrder.id, task_type: "pickup", status: "available" } });
    return tx.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        outlet: { select: { id: true, name: true, city: true } },
        pickup_address: { select: { id: true, label: true, address: true, city: true, district: true, province: true } },
        status_histories: { orderBy: { created_at: "desc" }, take: 20 },
        payment: { select: { status: true, amount: true, created_at: true } },
        customer: { select: { full_name: true } },
      },
    });
  });

  if (order) {
    emitToRoom(`outlet:${nearestOutlet.id}`, "order:new-pickup-request", {
      orderId: order.id, invoiceNumber: order.invoice_number,
      customerName: order.customer?.full_name, pickupAddress: order.pickup_address?.address, timestamp: new Date(),
    });
    await notifyOutletEmployees(nearestOutlet.id, ["outlet_admin", "driver"], "Permintaan pickup baru",
      `${order.customer?.full_name ?? "Customer"} memesan pickup (${order.invoice_number})`, "new_pickup_request", order.id);
  }
  return order;
};
