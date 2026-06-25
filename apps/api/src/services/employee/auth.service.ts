import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { verifyRefreshToken } from "../../utils/jwt.util.js";
import { revokeRefreshToken, hashToken, issueAuthTokens, buildAuthCookieOptions } from "../../utils/token.util.js";
import { sendEmployeeResetPasswordEmail } from "../../lib/email.js";
import { Response } from "express";

export const loginEmployee = async (
  email: string,
  password: string,
  res: Response,
) => {
  const employee = await prisma.employee.findFirst({
    where: { email, deleted_at: null },
    include: { outlet: { select: { id: true, name: true } } },
  });

  if (!employee) {
    throw new AppError("Email atau password salah.", 401);
  }

  const isValid = await bcrypt.compare(password, employee.password_hash);
  if (!isValid) {
    throw new AppError("Email atau password salah.", 401);
  }

  if (!employee.is_active) {
    throw new AppError("Email atau password salah.", 401);
  }

  await issueAuthTokens(res, {
    userId: employee.id,
    role: employee.role,
    email: employee.email,
    outletId: employee.outlet_id,
    tokenVersion: employee.token_version,
  });

  const { password_hash: _, outlet, ...employeeWithoutPassword } = employee;

  return {
    employee: {
      ...employeeWithoutPassword,
      outlet_name: outlet?.name ?? null,
    },
  };
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
    throw new AppError("Refresh token tidak valid atau kadaluarsa", 401);
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: hashToken(refreshToken),
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

  await issueAuthTokens(res, {
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
    outletId: payload.outletId,
    tokenVersion: payload.tokenVersion,
  });

  return {};
};

export const logoutEmployee = async (req: any, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie("accessToken", buildAuthCookieOptions());
  res.clearCookie("refreshToken", buildAuthCookieOptions());

  return { message: "Logout berhasil"}
};

export const forgotPassword = async (email: string) => {
  const employee = await prisma.employee.findUnique({ where: { email, deleted_at: null } });
  if (!employee) return { message: "Jika email terdaftar, link reset akan dikirimkan." };
  if (!employee.is_active) return { message: "Jika email terdaftar, link reset akan dikirimkan." };

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { employee_id: employee.id, used_at: null },
      data: { used_at: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: { employee_id: employee.id, token_hash: tokenHash, expires_at: expiresAt },
    }),
  ]);

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
  if (!record.employee.is_active) throw new AppError("Akun Anda tidak aktif.", 403);

  const password_hash = await bcrypt.hash(newPassword, 10);
  const [updatedEmployee] = await prisma.$transaction([
    prisma.employee.update({
      where: { id: record.employee_id },
      data: { password_hash, token_version: { increment: 1 } },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used_at: new Date() },
    }),
  ]);

  const employee = record.employee;

  await prisma.refreshToken.updateMany({
    where: { user_id: employee.id, user_type: "employee", revoked_at: null },
    data: { revoked_at: new Date() },
  });

  await issueAuthTokens(res, {
    userId: employee.id,
    role: employee.role,
    email: employee.email,
    outletId: employee.outlet_id,
    tokenVersion: updatedEmployee.token_version,
  });

  const outlet = employee.outlet_id
    ? await prisma.outlet.findUnique({ where: { id: employee.outlet_id }, select: { name: true } })
    : null;

  const { password_hash: _, ...employeeWithoutPassword } = employee;
  return {
    employee: { ...employeeWithoutPassword, outlet_name: outlet?.name ?? null },
  };
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

  await prisma.refreshToken.updateMany({
    where: { user_id: employeeId, user_type: "employee", revoked_at: null },
    data: { revoked_at: new Date() },
  });

  await issueAuthTokens(res, {
    userId: updated.id,
    role: updated.role,
    email: updated.email,
    outletId: updated.outlet_id,
    tokenVersion: updated.token_version,
  });

  return { message: "Password berhasil diubah." };
};

