import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.util.js";
import {
  signEmailToken,
  verifyEmailToken,
} from "../../utils/jwt.util.js";
import { sendVerificationEmail } from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  MAX_AVATAR_SIZE_BYTES,
  ALLOWED_AVATAR_MIME_TYPES,
} from "../../config/constants.js";

/** Get profile */
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      avatar_url: true,
      role: true,
      is_verified: true,
      created_at: true,
    },
  });
  if (!user) throw new AppError("User tidak ditemukan.", 404);
  return user;
};

/** Update personal data */
export const updateProfile = async (
  userId: string,
  data: {
    full_name?: string;
    phone?: string;
    new_email?: string;
  },
) => {
  const updateData: Record<string, unknown> = {};

  if (data.full_name) updateData.full_name = data.full_name;
  if (data.phone) updateData.phone = data.phone;

  if (data.new_email && data.new_email !== "") {
    // Check if email already taken
    const existing = await prisma.user.findUnique({
      where: { email: data.new_email },
    });
    if (existing && existing.id !== userId) {
      throw new AppError("Email sudah digunakan akun lain.", 409);
    }
    updateData.email = data.new_email;
    updateData.is_verified = false;

    // Send verification to new email
    const token = signEmailToken(
      { userId, email: data.new_email, purpose: "verify" },
      "1h",
    );
    await sendVerificationEmail(data.new_email, token);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      avatar_url: true,
      role: true,
      is_verified: true,
    },
  });

  return updated;
};

/** Change password */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User tidak ditemukan.", 404);

  const valid = await comparePassword(currentPassword, user.password_hash);
  if (!valid) throw new AppError("Password lama tidak sesuai.", 401);

  const password_hash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password_hash } });

  return { message: "Password berhasil diubah." };
};

/** Update avatar URL (after upload to cloud) */
export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatar_url: avatarUrl },
    select: { id: true, avatar_url: true },
  });
  return updated;
};
