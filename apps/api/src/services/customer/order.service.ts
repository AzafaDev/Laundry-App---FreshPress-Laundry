import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";

const WASH_AND_FOLD_RATE_PER_KG = 7_000;
const DRY_CLEANING_START_PRICE = 25_000;
const SERVICE_FEE = 2_000;

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

function parsePickupSchedule(pickupDate: string, pickupTimeSlot: string): Date {
  const [start] = pickupTimeSlot.split(" - ");
  if (!start) {
    throw new AppError("Slot waktu pickup tidak valid.", 400);
  }

  const match = start.match(/^(\d{2}):(\d{2})\s(AM|PM)$/);
  if (!match) {
    throw new AppError("Format slot waktu pickup tidak valid.", 400);
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3];

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const schedule = new Date(`${pickupDate}T00:00:00`);
  schedule.setHours(hour, minute, 0, 0);

  if (Number.isNaN(schedule.getTime())) {
    throw new AppError("Tanggal pickup tidak valid.", 400);
  }

  return schedule;
}

function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= FREE_RADIUS_KM) return 0;
  return FLAT_RATE_ONGKIR;
}

function estimateTotalPrice(serviceType: "wash-and-fold" | "dry-cleaning", estimatedWeightKg: number): number {
  if (serviceType === "dry-cleaning") {
    return DRY_CLEANING_START_PRICE + SERVICE_FEE;
  }
  return estimatedWeightKg * WASH_AND_FOLD_RATE_PER_KG + SERVICE_FEE;
}

export interface CreateCustomerOrderInput {
  pickup_address_id: string;
  pickup_date: string;
  pickup_time_slot: string;
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
    select: { id: true, latitude: true, longitude: true, opening_time: true, closing_time: true },
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
      opening_time: outlet.opening_time,
      closing_time: outlet.closing_time,
    }))
    .filter((outlet) => outlet.distance <= SERVICE_RADIUS_KM)
    .sort((a, b) => a.distance - b.distance)[0];

  if (!nearestOutlet) {
    throw new AppError("Alamat berada di luar jangkauan outlet.", 400);
  }

  const pickupSchedule = parsePickupSchedule(
    input.pickup_date,
    input.pickup_time_slot,
  );

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (pickupSchedule < todayStart) {
    throw new AppError("Jadwal pickup tidak boleh di masa lalu.", 400);
  }

  if (nearestOutlet.opening_time && nearestOutlet.closing_time) {
    const pickupHour = pickupSchedule.getHours();
    const pickupMinute = pickupSchedule.getMinutes();
    const openHour = new Date(nearestOutlet.opening_time).getUTCHours();
    const openMinute = new Date(nearestOutlet.opening_time).getUTCMinutes();
    const closeHour = new Date(nearestOutlet.closing_time).getUTCHours();
    const closeMinute = new Date(nearestOutlet.closing_time).getUTCMinutes();
    const pickupMins = pickupHour * 60 + pickupMinute;
    const openMins = openHour * 60 + openMinute;
    const closeMins = closeHour * 60 + closeMinute;
    if (pickupMins < openMins || pickupMins >= closeMins) {
      throw new AppError("Jadwal pickup di luar jam operasional outlet.", 400);
    }
  }

  const estimatedWeightKg =
    input.service_type === "dry-cleaning"
      ? 0
      : Number(input.estimated_weight_kg ?? 0);

  const totalPrice = estimateTotalPrice(input.service_type, estimatedWeightKg);

  const invoiceNumber = generateInvoiceNumber();

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        outlet_id: nearestOutlet.id,
        pickup_address_id: input.pickup_address_id,
        status: "waiting_pickup_driver",
        pickup_schedule: pickupSchedule,
        total_weight_kg: estimatedWeightKg,
        delivery_fee: calculateDeliveryFee(nearestOutlet.distance),
        total_price: totalPrice,
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
        status: "pending",
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