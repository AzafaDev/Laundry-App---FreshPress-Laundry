import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { geocodeAddress } from "../../utils/geocode.util.js";
import { haversineKm, calculateDeliveryFee, FREE_RADIUS_KM, FLAT_RATE_ONGKIR, type CreateAddressInput, type UpdateAddressInput } from "./address.helpers.js";

export type { CreateAddressInput, UpdateAddressInput };

export const listAddresses = async (customerId: string) => {
  return prisma.customerAddress.findMany({
    where: { customer_id: customerId },
    orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
  });
};

export const listAddressesPaginated = async (customerId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [addresses, total] = await Promise.all([
    prisma.customerAddress.findMany({
      where: { customer_id: customerId },
      orderBy: [{ is_primary: "desc" }, { created_at: "desc" }],
      skip,
      take: limit,
    }),
    prisma.customerAddress.count({ where: { customer_id: customerId } }),
  ]);
  return { addresses, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const createAddress = async (customerId: string, input: CreateAddressInput) => {
  if (input.is_primary) {
    await prisma.customerAddress.updateMany({ where: { customer_id: customerId, is_primary: true }, data: { is_primary: false } });
  }
  return prisma.customerAddress.create({
    data: {
      customer_id: customerId, label: input.label, address: input.address,
      province: input.province, city: input.city, district: input.district,
      postal_code: input.postal_code ?? null, latitude: input.latitude,
      longitude: input.longitude, is_primary: input.is_primary ?? false,
    },
  });
};

export const updateAddress = async (customerId: string, addressId: string, input: UpdateAddressInput) => {
  const existing = await prisma.customerAddress.findFirst({ where: { id: addressId, customer_id: customerId } });
  if (!existing) throw new AppError("Alamat tidak ditemukan.", 404);

  if (input.is_primary) {
    await prisma.customerAddress.updateMany({ where: { customer_id: customerId, is_primary: true }, data: { is_primary: false } });
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

export const setPrimaryAddress = async (customerId: string, addressId: string) => {
  const existing = await prisma.customerAddress.findFirst({ where: { id: addressId, customer_id: customerId } });
  if (!existing) throw new AppError("Alamat tidak ditemukan.", 404);
  await prisma.customerAddress.updateMany({ where: { customer_id: customerId, is_primary: true }, data: { is_primary: false } });
  return prisma.customerAddress.update({ where: { id: addressId }, data: { is_primary: true } });
};

export const deleteAddress = async (customerId: string, addressId: string) => {
  const existing = await prisma.customerAddress.findFirst({ where: { id: addressId, customer_id: customerId } });
  if (!existing) throw new AppError("Alamat tidak ditemukan.", 404);
  await prisma.customerAddress.delete({ where: { id: addressId } });
  if (existing.is_primary) {
    const next = await prisma.customerAddress.findFirst({ where: { customer_id: customerId }, orderBy: { created_at: "desc" } });
    if (next) await prisma.customerAddress.update({ where: { id: next.id }, data: { is_primary: true } });
  }
};

export const geocodeForCustomer = async (query: string) => geocodeAddress(query);

export const estimateDeliveryFee = async (customerId: string, addressId: string) => {
  const address = await prisma.customerAddress.findFirst({ where: { id: addressId, customer_id: customerId } });
  if (!address) throw new AppError("Alamat tidak ditemukan.", 404);

  const outlets = await prisma.outlet.findMany({
    where: { is_active: true, deleted_at: null },
    select: { id: true, name: true, address: true, city: true, latitude: true, longitude: true, service_radius_km: true },
  });
  if (outlets.length === 0) throw new AppError("Tidak ada outlet aktif.", 404);

  const customerLat = Number(address.latitude);
  const customerLon = Number(address.longitude);

  const outletDistances = outlets.map((o) => {
    const distKm = haversineKm(customerLat, customerLon, Number(o.latitude), Number(o.longitude));
    return {
      outlet_id: o.id, outlet_name: o.name, outlet_address: o.address, outlet_city: o.city,
      distance_km: Math.round(distKm * 10) / 10,
      within_service_area: distKm <= Number(o.service_radius_km),
      delivery_fee: calculateDeliveryFee(distKm),
    };
  });

  outletDistances.sort((a, b) => a.distance_km - b.distance_km);
  return {
    address_id: addressId,
    customer_address: { label: address.label, address: address.address, city: address.city, latitude: customerLat, longitude: customerLon },
    nearest_outlet: outletDistances[0],
    all_outlets: outletDistances,
    free_radius_km: FREE_RADIUS_KM,
    flat_rate_ongkir: FLAT_RATE_ONGKIR,
  };
};
