import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.util.js";
import { sendEmployeeResetPasswordEmail } from "../../lib/email.js";
import { Response } from "express";

async function storeRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
) {
  return prisma.refreshToken.create({
    data: {
      user_type: "employee",
      user_id: userId,
      token,
      expires_at: expiresAt,
    },
  });
}

async function revokeRefreshToken(token: string) {
  return prisma.refreshToken.updateMany({
    where: { token, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export const loginEmployee = async (
  email: string,
  password: string,
  res: Response,
) => {
  const employee = await prisma.employee.findFirst({
    where: { email, deleted_at: null },
  });

  if (!employee) {
    throw new AppError("Email atau password salah.", 401);
  }

  const isValid = await bcrypt.compare(password, employee.password_hash);
  if (!isValid) {
    throw new AppError("Email atau password salah.", 401);
  }

  if (!employee.is_active) {
    throw new AppError("Akun Anda tidak aktif.", 403);
  }

  const accessToken = signAccessToken({
    userId: employee.id,
    role: employee.role,
    email: employee.email,
    outletId: employee.outlet_id,
    tokenVersion: employee.token_version,
  });

  const refreshToken = signRefreshToken({
    userId: employee.id,
    role: employee.role,
    email: employee.email,
    outletId: employee.outlet_id,
    tokenVersion: employee.token_version,
  });

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const expiresMs = parseDuration(expiresIn);
  const expiresAt = new Date(Date.now() + expiresMs);

  await storeRefreshToken(employee.id, refreshToken, expiresAt);

  const accessExpiresMs = parseDuration(process.env.JWT_EXPIRES_IN || "15m");

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: accessExpiresMs,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: expiresMs,
  });

  const { password_hash: _, ...employeeWithoutPassword } = employee;

  return { employee: employeeWithoutPassword };
};

export const refreshEmployeeToken = async (req: any, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token tidak ditemukan", 401);
  }

  let payload: { userId: string; role: string; email: string; outletId?: string | null; tokenVersion?: number };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Refresh token tidak valid atau kadaluarsa");
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      user_type: "employee",
      user_id: payload.userId,
      revoked_at: null,
      expires_at: { gt: new Date() },
    },
  });

  if (!storedToken) {
    throw new AppError("Refresh token tidak valid", 401);
  }

  await revokeRefreshToken(refreshToken);

  const newAccessToken = signAccessToken({
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
    outletId: payload.outletId,
    tokenVersion: payload.tokenVersion,
  });

  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
    outletId: payload.outletId,
    tokenVersion: payload.tokenVersion,
  });

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const expiresMs = parseDuration(expiresIn);
  const expiresAt = new Date(Date.now() + expiresMs);

  await storeRefreshToken(payload.userId, newRefreshToken, expiresAt);

  const accessExpiresMs = parseDuration(process.env.JWT_EXPIRES_IN || "15m");

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: accessExpiresMs,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: expiresMs,
  });

  return {};
};

export const logoutEmployee = async (req: any, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  return { message: "Logout berhasil"}
};

export const forgotPassword = async (email: string) => {
  const employee = await prisma.employee.findUnique({ where: { email, deleted_at: null } });
  if (!employee) return { message: "Jika email terdaftar, link reset akan dikirimkan." };

  await prisma.passwordResetToken.updateMany({
    where: { employee_id: employee.id, used_at: null },
    data: { used_at: new Date() },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { employee_id: employee.id, token_hash: tokenHash, expires_at: expiresAt },
  });

  await sendEmployeeResetPasswordEmail(employee.email, rawToken);
  return { message: "Jika email terdaftar, link reset akan dikirimkan." };
};

export const resetPassword = async (rawToken: string, newPassword: string, res: Response) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await prisma.passwordResetToken.findFirst({
    where: { token_hash: tokenHash, used_at: null, expires_at: { gt: new Date() } },
    include: { employee: true },
  });

  if (!record) throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400);

  const password_hash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.employee.update({
      where: { id: record.employee_id },
      data: { password_hash, token_version: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used_at: new Date() },
    }),
  ]);

  // Auto-login: issue tokens so the frontend can redirect to the correct dashboard
  const employee = record.employee;
  const newTokenVersion = employee.token_version + 1;

  const accessToken = signAccessToken({
    userId: employee.id,
    role: employee.role,
    email: employee.email,
    outletId: employee.outlet_id,
    tokenVersion: newTokenVersion,
  });

  const refreshToken = signRefreshToken({
    userId: employee.id,
    role: employee.role,
    email: employee.email,
    outletId: employee.outlet_id,
    tokenVersion: newTokenVersion,
  });

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const expiresMs = parseDuration(expiresIn);
  const expiresAt = new Date(Date.now() + expiresMs);
  await storeRefreshToken(employee.id, refreshToken, expiresAt);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: expiresMs,
  });

  const { password_hash: _, ...employeeWithoutPassword } = employee;
  return { accessToken, employee: employeeWithoutPassword };
};

export const changePassword = async (
  employeeId: string,
  oldPassword: string,
  newPassword: string,
  res: Response,
) => {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new AppError("Akun tidak ditemukan.", 404);

  const isValid = await bcrypt.compare(oldPassword, employee.password_hash);
  if (!isValid) throw new AppError("Password lama tidak sesuai.", 400);

  const password_hash = await bcrypt.hash(newPassword, 10);
  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: { password_hash, token_version: { increment: 1 } },
    select: { id: true, role: true, email: true, outlet_id: true, token_version: true },
  });

  const accessToken = signAccessToken({
    userId: updated.id,
    role: updated.role,
    email: updated.email,
    outletId: updated.outlet_id,
    tokenVersion: updated.token_version,
  });

  const newRefreshToken = signRefreshToken({
    userId: updated.id,
    role: updated.role,
    email: updated.email,
    outletId: updated.outlet_id,
    tokenVersion: updated.token_version,
  });

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const expiresMs = parseDuration(expiresIn);

  await prisma.refreshToken.updateMany({
    where: { user_id: employeeId, user_type: "employee", revoked_at: null },
    data: { revoked_at: new Date() },
  });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      user_id: updated.id,
      user_type: "employee",
      expires_at: new Date(Date.now() + expiresMs),
    },
  });

  const accessExpiresMs = parseDuration(process.env.JWT_EXPIRES_IN || "15m");

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: accessExpiresMs,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: expiresMs,
  });

  return { message: "Password berhasil diubah." };
};

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhm])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
