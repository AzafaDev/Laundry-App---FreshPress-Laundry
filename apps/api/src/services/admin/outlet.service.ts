import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  geocodeAddress,
  searchAddress as searchAddressUtil,
} from "../../utils/geocode.util.js";
import type {
  CreateOutletInput,
  UpdateOutletInput,
  ListOutletQuery,
} from "../../validations/outlet.validation.js";

type ListOutletQueryExtended = ListOutletQuery & { include_deleted?: boolean };

const OUTLET_SELECT = {
  id: true,
  name: true,
  address: true,
  province: true,
  city: true,
  district: true,
  postal_code: true,
  phone: true,
  latitude: true,
  longitude: true,
  service_radius_km: true,
  is_active: true,
  deleted_at: true,
  created_at: true,
} satisfies Prisma.OutletSelect;

/** List outlets — paginated, optional search over name/address, optional is_active filter. */
export const listOutlets = async (query: ListOutletQueryExtended) => {
  const { page, limit, search, is_active, include_deleted } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.OutletWhereInput = {
    ...(include_deleted ? {} : { deleted_at: null }),
    ...(is_active !== undefined && { is_active }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.outlet.findMany({
      where,
      select: OUTLET_SELECT,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.outlet.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getOutletById = async (id: string) => {
  const outlet = await prisma.outlet.findUnique({
    where: { id },
    select: OUTLET_SELECT,
  });
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);
  return outlet;
};

/** Create outlet. If lat/lng not supplied, geocode the address via OpenCage. */
export const createOutlet = async (input: CreateOutletInput) => {
  let { latitude, longitude } = input;

  if (latitude == null || longitude == null) {
    const geo = await geocodeAddress(input.address);
    latitude = geo.latitude;
    longitude = geo.longitude;
  }

  return prisma.outlet.create({
    data: {
      name: input.name,
      address: input.address,
      province: input.province,
      city: input.city,
      district: input.district,
      postal_code: input.postal_code,
      latitude,
      longitude,
      service_radius_km: input.service_radius_km,
      is_active: input.is_active ?? true,
    },
    select: OUTLET_SELECT,
  });
};

/** Update outlet. If re_geocode is true and address changed and lat/lng not provided, re-geocode. */
export const updateOutlet = async (id: string, input: UpdateOutletInput) => {
  const existing = await prisma.outlet.findUnique({ where: { id } });
  if (!existing) throw new AppError("Outlet tidak ditemukan.", 404);

  let latitude = input.latitude ?? existing.latitude;
  let longitude = input.longitude ?? existing.longitude;

  const addressChanged = input.address && input.address !== existing.address;
  const coordsExplicit = input.latitude != null && input.longitude != null;

  if (addressChanged && !coordsExplicit && input.re_geocode) {
    const geo = await geocodeAddress(input.address!);
    latitude = geo.latitude;
    longitude = geo.longitude;
  }

  return prisma.outlet.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.province !== undefined && { province: input.province }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.district !== undefined && { district: input.district }),
      ...(input.postal_code !== undefined && { postal_code: input.postal_code }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(input.service_radius_km !== undefined && {
        service_radius_km: input.service_radius_km,
      }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    },
    select: OUTLET_SELECT,
  });
};

/** Soft-delete outlet (set deleted_at). */
export const softDeleteOutlet = async (id: string) => {
  const existing = await prisma.outlet.findUnique({ where: { id } });
  if (!existing) throw new AppError("Outlet tidak ditemukan.", 404);
  if (existing.deleted_at) throw new AppError("Outlet sudah dihapus.", 400);
  return prisma.outlet.update({
    where: { id },
    data: { deleted_at: new Date(), is_active: false },
    select: OUTLET_SELECT,
  });
};

/** Permanently delete an outlet. Requires soft-delete first. */
export const deleteOutlet = async (id: string) => {
  const existing = await prisma.outlet.findUnique({ where: { id } });
  if (!existing) throw new AppError("Outlet tidak ditemukan.", 404);
  if (!existing.deleted_at) {
    throw new AppError("Outlet harus dihapus (soft delete) terlebih dahulu sebelum dihapus permanen.", 400);
  }

  const orderCount = await prisma.order.count({ where: { outlet_id: id } });
  if (orderCount > 0) {
    throw new AppError(
      `Outlet tidak dapat dihapus permanen karena masih memiliki ${orderCount} order terkait.`,
      409,
    );
  }

  await prisma.outlet.delete({ where: { id } });
  return { id };
};

/** Assign an employee to an outlet by updating their outlet_id.
 *  If the employee is moving from a different outlet, their token_version
 *  is incremented so all existing sessions are immediately invalidated
 *  (they must log in again with the new outlet context).
 */
export const assignUserToOutlet = async (outletId: string, userId: string) => {
  const [outlet, employee] = await Promise.all([
    prisma.outlet.findUnique({ where: { id: outletId } }),
    prisma.employee.findUnique({ where: { id: userId } }),
  ]);
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);
  if (!employee || employee.deleted_at) throw new AppError("User tidak ditemukan.", 404);

  const isMovingOutlet =
    employee.outlet_id !== null && employee.outlet_id !== outletId;

  await prisma.employee.update({
    where: { id: userId },
    data: {
      outlet_id: outletId,
      // Force re-login if moving to a different outlet
      ...(isMovingOutlet && { token_version: { increment: 1 } }),
    },
  });

  return {
    outlet_id: outletId,
    user_id: userId,
    session_invalidated: isMovingOutlet,
  };
};

/** Returns up to limit candidate places matching the free-text query. */
export const searchAddress = async (q: string, limit = 5) =>
  searchAddressUtil(q, limit);

/** List employees currently assigned to an outlet. */
export const listOutletAssignments = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);

  return prisma.employee.findMany({
    where: { outlet_id: outletId, deleted_at: null },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      role: true,
      is_active: true,
      avatar_url: true,
      deleted_at: true,
      outlet_id: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
};

/** Unassign: set employee outlet_id to null. */
export const unassignUserFromOutlet = async (
  outletId: string,
  userId: string,
) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);

  await prisma.employee.update({
    where: { id: userId },
    data: { outlet_id: null },
  });

  return { outlet_id: outletId, user_id: userId };
};
