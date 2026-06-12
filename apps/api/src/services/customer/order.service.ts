import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { notifyCustomer } from "../../lib/notification.js";

const FREE_RADIUS_KM = Number(process.env.FREE_RADIUS_KM ?? 5);
const SERVICE_RADIUS_KM = Number(process.env.SERVICE_RADIUS_KM ?? 10);
const FLAT_RATE_ONGKIR = Number(process.env.FLAT_RATE_ONGKIR ?? 10_000);

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 900_000) + 100_000;
  return `INV-${y}${m}${d}-${random}`;
}

function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= FREE_RADIUS_KM) return 0;
  return FLAT_RATE_ONGKIR;
}

export interface CreateCustomerOrderInput {
  pickup_address_id: string;
  pickup_date: string;
  service_type: "wash-and-fold" | "dry-cleaning";
  estimated_weight_kg?: number;
  notes?: string;
}

export const createCustomerOrder = async (
  customerId: string,
  input: CreateCustomerOrderInput,
) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { is_verified: true },
  });
  if (!customer?.is_verified) {
    throw new AppError("Akun belum terverifikasi. Silakan verifikasi email terlebih dahulu.", 403);
  }

  const pickupAddress = await prisma.customerAddress.findFirst({
    where: { id: input.pickup_address_id, customer_id: customerId },
    select: {
      id: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!pickupAddress) {
    throw new AppError("Alamat pickup tidak ditemukan.", 404);
  }

  const outlets = await prisma.outlet.findMany({
    where: { is_active: true, deleted_at: null },
    select: { id: true, latitude: true, longitude: true },
  });

  if (outlets.length === 0) {
    throw new AppError("Tidak ada outlet aktif.", 404);
  }

  const nearestOutlet = outlets
    .map((outlet) => ({
      id: outlet.id,
      distance: haversineKm(
        Number(pickupAddress.latitude),
        Number(pickupAddress.longitude),
        Number(outlet.latitude),
        Number(outlet.longitude),
      ),
    }))
    .filter((outlet) => outlet.distance <= SERVICE_RADIUS_KM)
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearestOutlet) {
    throw new AppError("Alamat berada di luar jangkauan outlet.", 400);
  }

  const pickupDate = new Date(`${input.pickup_date}T00:00:00`);
  if (Number.isNaN(pickupDate.getTime())) {
    throw new AppError("Tanggal pickup tidak valid.", 400);
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (pickupDate < todayStart) {
    throw new AppError("Jadwal pickup tidak boleh di masa lalu.", 400);
  }

  const estimatedWeightKg =
    input.service_type === "dry-cleaning"
      ? 0
      : Number(input.estimated_weight_kg ?? 0);

  const invoiceNumber = generateInvoiceNumber();

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        outlet_id: nearestOutlet.id,
        pickup_address_id: input.pickup_address_id,
        status: "waiting_pickup_driver",
        total_weight_kg: estimatedWeightKg,
        delivery_fee: calculateDeliveryFee(nearestOutlet.distance),
        total_price: 0,
        notes: input.notes
          ? `[service:${input.service_type}] ${input.notes}`
          : `[service:${input.service_type}]`,
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        order_id: createdOrder.id,
        old_status: null,
        new_status: "waiting_pickup_driver",
        changed_by_type: "customer",
        changed_by_id: customerId,
        note: "Customer membuat permintaan pickup.",
      },
    });

    await tx.driverTask.create({
      data: {
        order_id: createdOrder.id,
        task_type: "pickup",
        status: "available",
      },
    });

    return tx.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        outlet: {
          select: { id: true, name: true, city: true },
        },
        pickup_address: {
          select: {
            id: true,
            label: true,
            address: true,
            city: true,
            district: true,
            province: true,
          },
        },
        status_histories: {
          orderBy: { created_at: "desc" },
          take: 20,
        },
        payment: {
          select: {
            status: true,
            amount: true,
            created_at: true,
          },
        },
      },
    });
  });

  return order;
};

export const listCustomerOrders = async (customerId: string) => {
  return prisma.order.findMany({
    where: { customer_id: customerId, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: {
      outlet: {
        select: { id: true, name: true, city: true },
      },
      status_histories: {
        orderBy: { created_at: "desc" },
        take: 20,
      },
      payment: {
        select: {
          status: true,
          amount: true,
          paid_at: true,
        },
      },
      order_items: {
        include: {
          laundry_item: {
            select: { id: true, name: true, unit: true },
          },
        },
      },
    },
  });
};

export const completeCustomerOrder = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customer_id: customerId, deleted_at: null },
  });

  if (!order) {
    throw new AppError("Order tidak ditemukan.", 404);
  }

  if (order.status !== "received_by_customer") {
    throw new AppError("Order belum bisa diselesaikan.", 400);
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: "completed" },
    }),
    prisma.orderStatusHistory.create({
      data: {
        order_id: order.id,
        old_status: "received_by_customer",
        new_status: "completed",
        changed_by_type: "customer",
        changed_by_id: customerId,
        note: "Customer mengonfirmasi pesanan telah selesai.",
      },
    }),
  ]);

  await notifyCustomer(
    customerId,
    "Pesanan selesai",
    `Pesanan ${order.invoice_number} telah selesai. Terima kasih telah menggunakan layanan kami.`,
    "order_completed",
    order.id,
  );

  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      outlet: { select: { id: true, name: true, city: true } },
      status_histories: { orderBy: { created_at: "desc" }, take: 20 },
      payment: { select: { status: true, amount: true, paid_at: true } },
      order_items: {
        include: {
          laundry_item: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  });
};

export interface CreateComplaintInput {
  complaint_type: string;
  description: string;
}

export const createCustomerComplaint = async (
  customerId: string,
  orderId: string,
  input: CreateComplaintInput,
) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customer_id: customerId, deleted_at: null },
  });

  if (!order) {
    throw new AppError("Order tidak ditemukan.", 404);
  }

  if (order.status !== "received_by_customer") {
    throw new AppError("Komplain hanya bisa diajukan untuk pesanan yang sudah diterima.", 400);
  }

  return prisma.complaint.create({
    data: {
      order_id: order.id,
      customer_id: customerId,
      complaint_type: input.complaint_type,
      description: input.description,
    },
  });
};

export const getCustomerOrderById = async (customerId: string, orderId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customer_id: customerId, deleted_at: null },
    include: {
      outlet: {
        select: { id: true, name: true, city: true, address: true },
      },
      pickup_address: {
        select: {
          id: true,
          label: true,
          address: true,
          city: true,
          district: true,
          province: true,
          postal_code: true,
        },
      },
      status_histories: {
        orderBy: { created_at: "desc" },
        take: 50,
      },
      payment: true,
      order_items: {
        include: {
          laundry_item: {
            select: { id: true, name: true, unit: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Order tidak ditemukan.", 404);
  }

  return order;
};