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

const OUTLET_SELECT = {
  id: true,
  name: true,
  address: true,
  latitude: true,
  longitude: true,
  max_service_km: true,
  is_active: true,
  created_at: true,
} satisfies Prisma.OutletSelect;

/** List outlets — paginated, optional `search` over name/address, optional is_active filter. */
export const listOutlets = async (query: ListOutletQuery) => {
  const { page, limit, search, is_active } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.OutletWhereInput = {
    ...(is_active !== undefined && { is_active }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
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

/**
 * Create outlet. If lat/lng not supplied, geocode the address via OpenCage.
 */
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
      latitude,
      longitude,
      max_service_km: input.max_service_km,
      is_active: input.is_active ?? true,
    },
    select: OUTLET_SELECT,
  });
};

/**
 * Update outlet. If `re_geocode` is true and `address` changed and lat/lng not provided,
 * we re-geocode the new address.
 */
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
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(input.max_service_km !== undefined && {
        max_service_km: input.max_service_km,
      }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    },
    select: OUTLET_SELECT,
  });
};

/** Soft-deactivate (set is_active = false). Hard delete is intentionally not exposed. */
export const deactivateOutlet = async (id: string) => {
  const existing = await prisma.outlet.findUnique({ where: { id } });
  if (!existing) throw new AppError("Outlet tidak ditemukan.", 404);
  return prisma.outlet.update({
    where: { id },
    data: { is_active: false },
    select: OUTLET_SELECT,
  });
};

/**
 * Assign a user (typically an outlet_admin / worker / driver) to an outlet by
 * promoting their role + recording the outlet via UserShift seed (a single
 * "default" shift row is created if no shifts exist for this outlet). This
 * keeps the schema unchanged but provides an explicit assignment trail.
 */
export const assignUserToOutlet = async (outletId: string, userId: string) => {
  const [outlet, user] = await Promise.all([
    prisma.outlet.findUnique({ where: { id: outletId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);
  if (!user || user.deleted_at) throw new AppError("User tidak ditemukan.", 404);

  // Find or create a default shift on this outlet that represents "assigned to outlet".
  const shift =
    (await prisma.shift.findFirst({
      where: { outlet_id: outletId, name: "default" },
    })) ??
    (await prisma.shift.create({
      data: {
        outlet_id: outletId,
        name: "default",
        start_time: "00:00:00",
        end_time: "23:59:59",
      },
    }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.userShift.upsert({
    where: {
      user_id_shift_id_shift_date: {
        user_id: userId,
        shift_id: shift.id,
        shift_date: today,
      },
    },
    update: { is_active: true },
    create: {
      user_id: userId,
      shift_id: shift.id,
      shift_date: today,
      is_active: true,
    },
  });

  return { outlet_id: outletId, user_id: userId, shift_id: shift.id };
};

/**
 * Returns up to `limit` candidate places matching the free-text query.
 * Used by the address autocomplete in the outlet form.
 */
export const searchAddress = async (q: string, limit = 5) =>
  searchAddressUtil(q, limit);

/**
 * List users currently assigned to an outlet. We look up UserShift rows joined
 * with their Shift, filter by outlet_id and is_active=true, and de-dupe per user
 * (a worker might have multiple shift entries on the same outlet).
 */
export const listOutletAssignments = async (outletId: string) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);

  const rows = await prisma.userShift.findMany({
    where: {
      is_active: true,
      shift: { outlet_id: outletId },
    },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          is_verified: true,
          avatar_url: true,
          deleted_at: true,
        },
      },
    },
    orderBy: { shift_date: "desc" },
  });

  // De-dup by user.id, keeping the most recent shift_date as `assigned_at`.
  const map = new Map<string, { user: typeof rows[number]["user"]; assigned_at: Date }>();
  for (const r of rows) {
    if (r.user.deleted_at) continue;
    const existing = map.get(r.user.id);
    if (!existing || existing.assigned_at < r.shift_date) {
      map.set(r.user.id, { user: r.user, assigned_at: r.shift_date });
    }
  }
  return Array.from(map.values()).map(({ user, assigned_at }) => ({
    ...user,
    assigned_at,
  }));
};

/**
 * Unassign: mark all UserShift rows for (outlet, user) as inactive. Keeps the
 * audit trail rather than hard-deleting.
 */
export const unassignUserFromOutlet = async (
  outletId: string,
  userId: string,
) => {
  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) throw new AppError("Outlet tidak ditemukan.", 404);

  await prisma.userShift.updateMany({
    where: {
      user_id: userId,
      is_active: true,
      shift: { outlet_id: outletId },
    },
    data: { is_active: false },
  });
  return { outlet_id: outletId, user_id: userId };
};
