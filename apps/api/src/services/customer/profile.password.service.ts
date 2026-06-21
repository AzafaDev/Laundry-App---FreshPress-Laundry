import { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.util.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.util.js";
import { parseDuration, storeRefreshToken } from "../../utils/token.util.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const changePassword = async (userId: string, currentPassword: string, newPassword: string, res: Response) => {
  const customer = await prisma.customer.findUnique({ where: { id: userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);
  if (!customer.password_hash) throw new AppError("Password lama tidak sesuai.", 401);

  const valid = await comparePassword(currentPassword, customer.password_hash);
  if (!valid) throw new AppError("Password lama tidak sesuai.", 401);

  const password_hash = await hashPassword(newPassword);
  const updated = await prisma.customer.update({
    where: { id: userId },
    data: { password_hash, token_version: { increment: 1 } },
    select: { id: true, email: true, token_version: true },
  });

  await prisma.refreshToken.updateMany({ where: { user_id: userId, user_type: "customer", revoked_at: null }, data: { revoked_at: new Date() } });

  const accessExpiresMs = parseDuration(process.env.JWT_EXPIRES_IN || "15m");
  const refreshExpiresMs = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN || "7d");
  const cookieOpts = (maxAge: number) => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as "none" | "strict", maxAge });

  const accessToken = signAccessToken({ userId: updated.id, role: "customer", email: updated.email, tokenVersion: updated.token_version });
  const refreshToken = signRefreshToken({ userId: updated.id, role: "customer", email: updated.email, tokenVersion: updated.token_version });

  res.cookie("accessToken", accessToken, cookieOpts(accessExpiresMs));
  res.cookie("refreshToken", refreshToken, cookieOpts(refreshExpiresMs));
  await storeRefreshToken(updated.id, refreshToken, new Date(Date.now() + refreshExpiresMs), "customer");

  return { message: "Password berhasil diubah." };
};
