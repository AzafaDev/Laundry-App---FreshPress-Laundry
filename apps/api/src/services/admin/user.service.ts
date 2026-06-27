import crypto from "crypto";
import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../utils/hash.util.js";
import { sendEmployeeInviteEmail } from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  ListUserQuery,
  ListCustomerQuery,
} from "../../validations/user.validation.js";

const PUBLIC_EMPLOYEE_SELECT = {
  id: true,
  email: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  role: true,
  outlet_id: true,
  outlet: { select: { id: true, name: true } },
  is_active: true,
  is_occupied: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.EmployeeSelect;

/** List employees with pagination, role filter, outlet filter, and free-text search. */
export const listUsers = async (query: ListUserQuery) => {
  const { page, limit, role, search, outlet_id, include_deleted } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.EmployeeWhereInput = {
    ...(include_deleted ? {} : { deleted_at: null }),
    ...(role ? { role: role as any } : {}),
    ...(outlet_id ? { outlet_id } : {}),
    ...(search
      ? {
          OR: [
            { full_name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      select: PUBLIC_EMPLOYEE_SELECT,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.employee.count({ where }),
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

/** Get a single employee by id. */
export const getUserById = async (id: string) => {
  const user = await prisma.employee.findFirst({
    where: { id, deleted_at: null },
    select: PUBLIC_EMPLOYEE_SELECT,
  });
  if (!user) throw new AppError("User tidak ditemukan.", 404);
  return user;
};

/** Create a new employee account.
 *  - If `password` is provided: set it directly (no email sent).
 *  - If `password` is omitted: create with a random placeholder hash, then
 *    store a PasswordResetToken (24 h) and send an invite email so the
 *    employee sets their own password via /employee/reset-password.
 */
export const createUser = async (input: CreateUserInput) => {
  const existing = await prisma.employee.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email sudah terdaftar.", 409);

  // Use provided password or a random placeholder
  const password_hash = await hashPassword(
    input.password ?? crypto.randomBytes(24).toString("hex"),
  );

  const user = await prisma.employee.create({
    data: {
      full_name: input.full_name,
      email: input.email,
      phone: input.phone ?? null,
      role: input.role as any,
      password_hash,
      // If no password supplied (invite flow), account starts inactive until employee sets password
      is_active: input.password ? (input.is_active ?? true) : false,
      outlet_id: input.outlet_id ?? null,
    },
    select: PUBLIC_EMPLOYEE_SELECT,
  });

  // If no password was supplied, generate a PasswordResetToken and send invite
  if (!input.password) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.passwordResetToken.create({
      data: { employee_id: user.id, token_hash: tokenHash, expires_at: expiresAt },
    });

    // Fire-and-forget — don't block the API response on email delivery
    sendEmployeeInviteEmail(user.email, user.full_name, rawToken).catch((err) =>
      console.error("Failed to send invite email:", err),
    );
  }

  return { ...user, invite_sent: !input.password };
};

/** Patch an existing employee. */
export const updateUser = async (id: string, input: UpdateUserInput) => {
  const target = await prisma.employee.findUnique({ where: { id } });
  if (!target || target.deleted_at) {
    throw new AppError("User tidak ditemukan.", 404);
  }

  if (input.email && input.email !== target.email) {
    const conflict = await prisma.employee.findUnique({
      where: { email: input.email },
    });
    if (conflict && conflict.id !== id) {
      throw new AppError("Email sudah digunakan akun lain.", 409);
    }
  }

  const data: Prisma.EmployeeUpdateInput = {
    ...(input.full_name !== undefined && { full_name: input.full_name }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.role !== undefined && { role: input.role as any }),
    ...(input.outlet_id !== undefined && { outlet_id: input.outlet_id }),
    ...(input.is_active !== undefined && { is_active: input.is_active }),
    ...(input.password && { password_hash: await hashPassword(input.password) }),
  };

  return prisma.employee.update({
    where: { id },
    data,
    select: PUBLIC_EMPLOYEE_SELECT,
  });
};

/** Permanently delete a user that has already been soft-deleted. */
export const hardDeleteUser = async (id: string, requesterId: string) => {
  if (id === requesterId) {
    throw new AppError("Tidak dapat menghapus akun sendiri.", 400);
  }
  const target = await prisma.employee.findUnique({ where: { id } });
  if (!target) throw new AppError("User tidak ditemukan.", 404);
  if (!target.deleted_at) {
    throw new AppError("User harus di-soft-delete terlebih dahulu sebelum dihapus permanen.", 400);
  }

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { employee_id: id } }),
    prisma.employeeShift.deleteMany({ where: { employee_id: id } }),
    prisma.attendance.deleteMany({ where: { employee_id: id } }),
    prisma.employee.delete({ where: { id } }),
  ]);

  return { id };
};

/**
 * Resend an invite / re-verification email so an inactive user can set (or reset)
 * their password. Works for both first-time invites and admin-deactivated accounts.
 * When the user clicks the link and sets a password, `is_active` becomes true automatically.
 */
export const resendInvite = async (id: string) => {
  const target = await prisma.employee.findFirst({ where: { id, deleted_at: null } });
  if (!target) throw new AppError("User tidak ditemukan.", 404);
  if (target.is_active) throw new AppError("User sudah aktif. Tidak perlu kirim undangan ulang.", 400);

  // Invalidate all existing unused tokens first
  await prisma.passwordResetToken.deleteMany({
    where: { employee_id: id, used_at: null },
  });

  // Create a fresh 24-hour token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { employee_id: id, token_hash: tokenHash, expires_at: expiresAt },
  });

  sendEmployeeInviteEmail(target.email, target.full_name, rawToken).catch((err) =>
    console.error("Failed to send re-invite email:", err),
  );

  return { id, email: target.email };
};

/** Soft-delete: mark deleted_at instead of removing the row. */
export const softDeleteUser = async (id: string, requesterId: string) => {
  if (id === requesterId) {
    throw new AppError("Tidak dapat menghapus akun sendiri.", 400);
  }
  const target = await prisma.employee.findUnique({ where: { id } });
  if (!target || target.deleted_at) {
    throw new AppError("User tidak ditemukan.", 404);
  }

  const [updated] = await prisma.$transaction([
    prisma.employee.update({
      where: { id },
      data: { deleted_at: new Date() },
      select: PUBLIC_EMPLOYEE_SELECT,
    }),
    prisma.refreshToken.updateMany({
      where: { user_id: id, user_type: "employee", revoked_at: null },
      data: { revoked_at: new Date() },
    }),
  ]);

  return updated;
};

/** List all registered customers — paginated, searchable, filterable by verification status. */
export const listCustomers = async (query: ListCustomerQuery) => {
  const { page, limit, search, is_verified, include_deleted } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {
    ...(include_deleted ? {} : { deleted_at: null }),
    ...(is_verified !== undefined && { is_verified }),
    ...(search
      ? {
          OR: [
            { full_name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        avatar_url: true,
        is_verified: true,
        is_active: true,
        deleted_at: true,
        created_at: true,
        updated_at: true,
        _count: { select: { orders: true, complaints: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where }),
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
