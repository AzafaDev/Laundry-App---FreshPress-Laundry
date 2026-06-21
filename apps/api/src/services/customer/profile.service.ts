import { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { signEmailToken, verifyEmailToken } from "../../utils/jwt.util.js";
import { sendEmailChangeVerification } from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";

// Re-export so controllers' namespace import still works
export { changePassword } from "./profile.password.service.js";

const PROFILE_SELECT = { id: true, full_name: true, email: true, phone: true, avatar_url: true, is_verified: true } as const;

export const getProfile = async (userId: string) => {
  const customer = await prisma.customer.findUnique({ where: { id: userId }, select: { ...PROFILE_SELECT, created_at: true } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);
  return customer;
};

export const updateProfile = async (userId: string, data: { full_name?: string; phone?: string; new_email?: string }) => {
  const updateData: Record<string, unknown> = {};
  if (data.full_name) updateData.full_name = data.full_name;
  if (data.phone) updateData.phone = data.phone;

  let emailChangePending = false;
  let emailSendError = false;

  if (data.new_email && data.new_email !== "") {
    const current = await prisma.customer.findUnique({ where: { id: userId } });
    if (!current) throw new AppError("User tidak ditemukan.", 404);

    if (data.new_email !== current.email) {
      const existing = await prisma.customer.findUnique({ where: { email: data.new_email } });
      if (existing && existing.id !== userId) throw new AppError("Email sudah digunakan akun lain.", 409);

      const token = signEmailToken({ userId, newEmail: data.new_email, purpose: "change-email" }, "1h");
      try {
        await sendEmailChangeVerification(data.new_email, token);
        emailChangePending = true;
      } catch (emailErr) {
        console.error("[updateProfile] Failed to send email change verification:", emailErr);
        emailSendError = true;
      }
    }
  }

  const updated = Object.keys(updateData).length > 0
    ? await prisma.customer.update({ where: { id: userId }, data: updateData, select: PROFILE_SELECT })
    : await prisma.customer.findUniqueOrThrow({ where: { id: userId }, select: PROFILE_SELECT });

  if (emailSendError) {
    throw new AppError("Profil berhasil diperbarui, namun email verifikasi gagal dikirim. Pastikan konfigurasi SMTP sudah benar lalu coba lagi.", 503);
  }

  return { ...updated, ...(emailChangePending && { message: "Link konfirmasi telah dikirim ke email baru Anda. Silakan cek inbox untuk mengkonfirmasi perubahan email." }) };
};

export const verifyEmailChange = async (token: string) => {
  let payload: { userId: string; newEmail: string; purpose: string };
  try { payload = verifyEmailToken<typeof payload>(token); }
  catch { throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400); }
  if (payload.purpose !== "change-email") throw new AppError("Token tidak valid.", 400);

  const customer = await prisma.customer.findUnique({ where: { id: payload.userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);

  const existing = await prisma.customer.findUnique({ where: { email: payload.newEmail } });
  if (existing && existing.id !== payload.userId) throw new AppError("Email sudah digunakan akun lain.", 409);

  await prisma.customer.update({ where: { id: payload.userId }, data: { email: payload.newEmail } });
  return { message: "Email berhasil diubah." };
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  try {
    return await prisma.customer.update({ where: { id: userId }, data: { avatar_url: avatarUrl }, select: { id: true, avatar_url: true } });
  } catch (err: any) {
    if (err?.code === "P2025") throw new AppError("Customer tidak ditemukan.", 404);
    throw err;
  }
};
