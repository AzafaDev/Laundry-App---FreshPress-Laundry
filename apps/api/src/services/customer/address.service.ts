// Customer address service — CRUD + delivery fee estimation
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { geocodeAddress } from "../../utils/geocode.util.js";

// ─── Haversine distance (km) ─────────────────────────────────────────────────
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

// Flat ongkir: gratis dalam radius bebas, kena flat rate jika lebih
const FREE_RADIUS_KM = Number(5);
const FLAT_RATE_ONGKIR = Number(10_000);

function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= FREE_RADIUS_KM) return 0;
  return FLAT_RATE_ONGKIR;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CreateAddressInput {
  label: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  is_primary?: boolean;
}

export interface UpdateAddressInput extends Partial<CreateAddressInput> {}

// ─── List ─────────────────────────────────────────────────────────────────────
export const listAddresses = async (customerId: string) => {
  return prisma.customerAddress.findMany({
    where: { customer_id: customerId },
    orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
  });
};

// ─── Create ───────────────────────────────────────────────────────────────────
export const createAddress = async (
  customerId: string,
  input: CreateAddressInput,
) => {
  // If this should be primary, demote existing primary first
  if (input.is_primary) {
    await prisma.customerAddress.updateMany({
      where: { customer_id: customerId, is_primary: true },
      data: { is_primary: false },
    });
  }

  return prisma.customerAddress.create({
    data: {
      customer_id: customerId,
      label: input.label,
      address: input.address,
      province: input.province,
      city: input.city,
      district: input.district,
      postal_code: input.postal_code ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      is_primary: input.is_primary ?? false,
    },
  });
};

// ─── Update ───────────────────────────────────────────────────────────────────
export const updateAddress = async (
  customerId: string,
  addressId: string,
  input: UpdateAddressInput,
) => {
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customer_id: customerId },
  });
  if (!existing) throw new AppError("Alamat tidak ditemukan.", 404);

  if (input.is_primary) {
    await prisma.customerAddress.updateMany({
      where: { customer_id: customerId, is_primary: true },
      data: { is_primary: false },
    });
  }

  return prisma.customerAddress.update({
    where: { id: addressId },
    data: {
      ...(input.label !== undefined && { label: input.label }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.province !== undefined && { province: input.province }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.district !== undefined && { district: input.district }),
      ...(input.postal_code !== undefined && { postal_code: input.postal_code }),
      ...(input.latitude !== undefined && { latitude: input.latitude }),
      ...(input.longitude !== undefined && { longitude: input.longitude }),
      ...(input.is_primary !== undefined && { is_primary: input.is_primary }),
    },
  });
};

// ─── Set Primary ──────────────────────────────────────────────────────────────
export const setPrimaryAddress = async (
  customerId: string,
  addressId: string,
) => {
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customer_id: customerId },
  });
  if (!existing) throw new AppError("Alamat tidak ditemukan.", 404);

  await prisma.customerAddress.updateMany({
    where: { customer_id: customerId, is_primary: true },
    data: { is_primary: false },
  });

  return prisma.customerAddress.update({
    where: { id: addressId },
    data: { is_primary: true },
  });
};

// ─── Delete ───────────────────────────────────────────────────────────────────
export const deleteAddress = async (customerId: string, addressId: string) => {
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customer_id: customerId },
  });
  if (!existing) throw new AppError("Alamat tidak ditemukan.", 404);

  await prisma.customerAddress.delete({ where: { id: addressId } });

  // If the deleted address was primary, promote the most recent one
  if (existing.is_primary) {
    const next = await prisma.customerAddress.findFirst({
      where: { customer_id: customerId },
      orderBy: { created_at: "desc" },
    });
    if (next) {
      await prisma.customerAddress.update({
        where: { id: next.id },
        data: { is_primary: true },
      });
    }
  }
};

// ─── Geocode search (proxy OpenCage, keeps API key server-side) ────────────────
export const geocodeForCustomer = async (query: string) => {
  return geocodeAddress(query);
};

// ─── Delivery fee estimation ──────────────────────────────────────────────────
export const estimateDeliveryFee = async (
  customerId: string,
  addressId: string,
) => {
  const address = await prisma.customerAddress.findFirst({
    where: { id: addressId, customer_id: customerId },
  });
  if (!address) throw new AppError("Alamat tidak ditemukan.", 404);

  const outlets = await prisma.outlet.findMany({
    where: { is_active: true, deleted_at: null },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      latitude: true,
      longitude: true,
      service_radius_km: true,
    },
  });

  if (outlets.length === 0) throw new AppError("Tidak ada outlet aktif.", 404);

  const customerLat = Number(address.latitude);
  const customerLon = Number(address.longitude);

  const outletDistances = outlets.map((o) => {
    const distKm = haversineKm(
      customerLat,
      customerLon,
      Number(o.latitude),
      Number(o.longitude),
    );
    return {
      outlet_id: o.id,
      outlet_name: o.name,
      outlet_address: o.address,
      outlet_city: o.city,
      distance_km: Math.round(distKm * 10) / 10,
      within_service_area: distKm <= Number(o.service_radius_km),
      delivery_fee: calculateDeliveryFee(distKm),
    };
  });

  outletDistances.sort((a, b) => a.distance_km - b.distance_km);
  const nearest = outletDistances[0];

  return {
    address_id: addressId,
    customer_address: {
      label: address.label,
      address: address.address,
      city: address.city,
      latitude: customerLat,
      longitude: customerLon,
    },
    nearest_outlet: nearest,
    all_outlets: outletDistances,
    free_radius_km: FREE_RADIUS_KM,
    flat_rate_ongkir: FLAT_RATE_ONGKIR,
  };
};
