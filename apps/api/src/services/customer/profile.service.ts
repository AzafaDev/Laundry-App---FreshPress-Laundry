import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.util.js";
import {
  signEmailToken,
  verifyEmailToken,
} from "../../utils/jwt.util.js";
import { sendEmailChangeVerification } from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  MAX_AVATAR_SIZE_BYTES,
  ALLOWED_AVATAR_MIME_TYPES,
} from "../../config/constants.js";

/** Get profile */
export const getProfile = async (userId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: userId },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      avatar_url: true,
      is_verified: true,
      created_at: true,
    },
  });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);
  return customer;
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

  let emailChangePending = false;
  let emailSendError = false;

  if (data.new_email && data.new_email !== "") {
    // Load the current customer to compare emails
    const current = await prisma.customer.findUnique({ where: { id: userId } });
    if (!current) throw new AppError("User tidak ditemukan.", 404);

    if (data.new_email !== current.email) {
      // Check if the new email is already taken by another account
      const existing = await prisma.customer.findUnique({
        where: { email: data.new_email },
      });
      if (existing && existing.id !== userId) {
        throw new AppError("Email sudah digunakan akun lain.", 409);
      }

      // Do NOT change the email yet — send verification to the new email first
      const token = signEmailToken(
        { userId, newEmail: data.new_email, purpose: "change-email" },
        "1h",
      );
      try {
        await sendEmailChangeVerification(data.new_email, token);
        emailChangePending = true;
      } catch (emailErr) {
        console.error("[updateProfile] Failed to send email change verification:", emailErr);
        emailSendError = true;
      }
    }
  }

  // Save profile changes (name/phone) regardless of email outcome
  const updated = Object.keys(updateData).length > 0
    ? await prisma.customer.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          avatar_url: true,
          is_verified: true,
        },
      })
    : await prisma.customer.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          avatar_url: true,
          is_verified: true,
        },
      });

  if (emailSendError) {
    throw new AppError(
      "Profil berhasil diperbarui, namun email verifikasi gagal dikirim. Pastikan konfigurasi SMTP sudah benar lalu coba lagi.",
      503,
    );
  }

  return {
    ...updated,
    ...(emailChangePending && {
      message: "Link konfirmasi telah dikirim ke email baru Anda. Silakan cek inbox untuk mengkonfirmasi perubahan email.",
    }),
  };
};

/** Verify email change – called when user clicks link in change-email email */
export const verifyEmailChange = async (token: string) => {
  let payload: { userId: string; newEmail: string; purpose: string };
  try {
    payload = verifyEmailToken<typeof payload>(token);
  } catch {
    throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400);
  }

  if (payload.purpose !== "change-email") {
    throw new AppError("Token tidak valid.", 400);
  }

  const customer = await prisma.customer.findUnique({ where: { id: payload.userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);

  // Ensure the new email is still not taken by another account
  const existing = await prisma.customer.findUnique({ where: { email: payload.newEmail } });
  if (existing && existing.id !== payload.userId) {
    throw new AppError("Email sudah digunakan akun lain.", 409);
  }

  await prisma.customer.update({
    where: { id: payload.userId },
    data: { email: payload.newEmail },
  });

  return { message: "Email berhasil diubah." };
};

/** Change password */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const customer = await prisma.customer.findUnique({ where: { id: userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);
  if (!customer.password_hash) throw new AppError("Password lama tidak sesuai.", 401);

  const valid = await comparePassword(currentPassword, customer.password_hash);
  if (!valid) throw new AppError("Password lama tidak sesuai.", 401);

  const password_hash = await hashPassword(newPassword);
  await prisma.customer.update({ where: { id: userId }, data: { password_hash } });

  return { message: "Password berhasil diubah." };
};

/** Update avatar URL (after upload to cloud) */
export const updateAvatar = async (userId: string, avatarUrl: string) => {
  try {
    const updated = await prisma.customer.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl },
      select: { id: true, avatar_url: true },
    });
    return updated;
  } catch (err: any) {
    if (err?.code === "P2025") throw new AppError("Customer tidak ditemukan.", 404);
    throw err;
  }
};
