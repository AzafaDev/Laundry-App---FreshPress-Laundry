import crypto from "crypto";
import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../utils/hash.util.js";
import { signEmailToken } from "../../utils/jwt.util.js";
import { sendVerificationEmail } from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  ListUserQuery,
} from "../../validations/user.validation.js";

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  role: true,
  is_active: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.EmployeeSelect;

/** List users with pagination, role filter, and free-text search. */
export const listUsers = async (query: ListUserQuery) => {
  const { page, limit, role, search, include_deleted } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.EmployeeWhereInput = {
    ...(include_deleted ? {} : { deleted_at: null }),
    ...(role ? { role: role as any } : {}),
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
      select: PUBLIC_USER_SELECT,
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

/** Get a single user by id (must be active). */
export const getUserById = async (id: string) => {
  const user = await prisma.employee.findFirst({
    where: { id, deleted_at: null },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) throw new AppError("User tidak ditemukan.", 404);
  return user;
};

/**
 * Create a new user.
 *
 * Two modes:
 *  - **Direct create**: admin supplies `password` → account is ready to log in
 *    (is_verified defaults to true).
 *  - **Invite**: admin leaves `password` blank → we stash a random placeholder
 *    hash, mark `is_verified: false`, and send the standard verification email
 *    so the user clicks the link, sets their own password, and is then verified
 *    via the existing /v1/customer/auth/verify endpoint.
 *
 * The return shape includes an `invited` flag so the API consumer (the admin
 * UI) can show the right confirmation copy.
 */
export const createUser = async (input: CreateUserInput) => {
  const existing = await prisma.employee.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email sudah terdaftar.", 409);

  const isInvite = !input.password;
  const password_hash = await hashPassword(
    isInvite ? crypto.randomBytes(24).toString("hex") : input.password!,
  );

  const user = await prisma.employee.create({
    data: {
      full_name: input.full_name,
      email: input.email,
      phone: input.phone,
      role: input.role as any,
      password_hash,
      is_active: !isInvite,
    },
    select: PUBLIC_USER_SELECT,
  });

  if (isInvite) {
    const token = signEmailToken(
      { userId: user.id, email: user.email, purpose: "verify" },
      "24h", // longer window for admin invites
    );
    try {
      await sendVerificationEmail(user.email, token);
    } catch (err) {
      // If the SMTP transport fails we don't want to leave the admin guessing;
      // bubble up a 502 so the UI can show "user created but email failed".
      // The row stays in place — the admin can re-trigger via the existing
      // resend-verification endpoint.
      console.error("[admin.createUser] failed to send invite email:", err);
      throw new AppError(
        "User dibuat, tapi email invite gagal terkirim. Coba kirim ulang verifikasi.",
        502,
      );
    }
  }

  return { ...user, invited: isInvite };
};

/** Patch an existing user. */
export const updateUser = async (id: string, input: UpdateUserInput) => {
  const target = await prisma.employee.findUnique({ where: { id } });
  if (!target || target.deleted_at) {
    throw new AppError("User tidak ditemukan.", 404);
  }

  // Email uniqueness guard when changing email.
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
    ...(input.is_verified !== undefined && { is_active: input.is_verified }),
    ...(input.password && { password_hash: await hashPassword(input.password) }),
  };

  return prisma.employee.update({
    where: { id },
    data,
    select: PUBLIC_USER_SELECT,
  });
};

/** Soft-delete: mark `deleted_at` instead of removing the row. */
export const softDeleteUser = async (id: string, requesterId: string) => {
  if (id === requesterId) {
    throw new AppError("Tidak dapat menghapus akun sendiri.", 400);
  }
  const target = await prisma.employee.findUnique({ where: { id } });
  if (!target || target.deleted_at) {
    throw new AppError("User tidak ditemukan.", 404);
  }

  return prisma.employee.update({
    where: { id },
    data: { deleted_at: new Date() },
    select: PUBLIC_USER_SELECT,
  });
};
