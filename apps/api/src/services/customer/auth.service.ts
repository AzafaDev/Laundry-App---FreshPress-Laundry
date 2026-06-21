import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.util.js";
import { signEmailToken, verifyEmailToken, verifyRefreshToken } from "../../utils/jwt.util.js";
import { revokeRefreshToken, hashToken } from "../../utils/token.util.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { COOKIE_OPTS, issueTokenCookies } from "./auth.cookies.js";

// Re-export Google OAuth so controllers' namespace import still works
export { getGoogleAuthUrl, googleLogin } from "./auth.oauth.service.js";

export const registerCustomer = async (data: { full_name: string; email: string; phone?: string }) => {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Email sudah terdaftar.", 409);

  const tempHash = await hashPassword(crypto.randomBytes(16).toString("hex"));
  const customer = await prisma.customer.create({
    data: { full_name: data.full_name, email: data.email, phone: data.phone ?? "", password_hash: tempHash, is_verified: false },
  });

  const token = signEmailToken({ userId: customer.id, email: customer.email, purpose: "verify" }, "1h");
  try { await sendVerificationEmail(customer.email, token); }
  catch (emailErr) { console.error("[registerCustomer] Failed to send verification email:", emailErr); }
  return { message: "Email verifikasi telah dikirim." };
};

export const resendVerification = async (email: string) => {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) throw new AppError("Email tidak ditemukan.", 404);
  if (customer.is_verified) throw new AppError("Akun sudah terverifikasi.", 400);
  const token = signEmailToken({ userId: customer.id, email, purpose: "verify" }, "1h");
  await sendVerificationEmail(email, token);
  return { message: "Email verifikasi telah dikirim ulang." };
};

export const verifyEmailAndSetPassword = async (token: string, password: string) => {
  let payload: { userId: string; email: string; purpose: string };
  try { payload = verifyEmailToken<typeof payload>(token); }
  catch { throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400); }
  if (payload.purpose !== "verify") throw new AppError("Token tidak valid.", 400);

  const customer = await prisma.customer.findUnique({ where: { id: payload.userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);
  if (customer.is_verified) throw new AppError("Akun sudah pernah diverifikasi.", 400);

  const password_hash = await hashPassword(password);
  await prisma.customer.update({ where: { id: customer.id }, data: { is_verified: true, password_hash } });
  return { message: "Akun berhasil diverifikasi. Silakan login." };
};

export const loginCustomer = async (email: string, password: string, res: Response) => {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) throw new AppError("Email atau password salah.", 401);
  if (!customer.password_hash) throw new AppError("Email atau password salah.", 401);
  const valid = await comparePassword(password, customer.password_hash);
  if (!valid) throw new AppError("Email atau password salah.", 401);
  if (!customer.is_verified) throw new AppError("Akun belum diverifikasi.", 403);
  issueTokenCookies(res, { userId: customer.id, role: "customer", email: customer.email, tokenVersion: customer.token_version });
  const { password_hash: _, ...safeCustomer } = customer;
  return { user: safeCustomer };
};

export const refreshCustomerToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token tidak ditemukan.", 401);

  let payload: { userId: string; role: string; email: string; tokenVersion?: number };
  try { payload = verifyRefreshToken(refreshToken); }
  catch { throw new AppError("Refresh token tidak valid atau kadaluarsa.", 401); }

  const storedToken = await prisma.refreshToken.findFirst({
    where: { token: hashToken(refreshToken), user_type: "customer", user_id: payload.userId, revoked_at: null, expires_at: { gt: new Date() } },
  });
  if (!storedToken) throw new AppError("Refresh token tidak valid.", 401);

  await revokeRefreshToken(refreshToken);
  const customer = await prisma.customer.findFirst({ where: { id: payload.userId, deleted_at: null }, select: { id: true, token_version: true } });
  if (!customer) throw new AppError("Akun tidak ditemukan.", 401);

  issueTokenCookies(res, { userId: customer.id, role: "customer", email: payload.email, tokenVersion: customer.token_version });
  return {};
};

export const logoutCustomer = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) await revokeRefreshToken(refreshToken);
  res.clearCookie("accessToken", COOKIE_OPTS(0));
  res.clearCookie("refreshToken", COOKIE_OPTS(0));
  return { message: "Logout berhasil." };
};

export const forgotPassword = async (email: string) => {
  const customer = await prisma.customer.findFirst({ where: { email, deleted_at: null } });
  if (!customer || !customer.is_verified) return { message: "Jika email terdaftar, link reset akan dikirimkan." };
  const token = signEmailToken({ userId: customer.id, email: customer.email, purpose: "reset", nonce: crypto.randomBytes(8).toString("hex") }, "1h");
  await sendResetPasswordEmail(customer.email, token);
  return { message: "Jika email terdaftar, link reset akan dikirimkan." };
};

export const resetPassword = async (token: string, newPassword: string) => {
  let payload: { userId: string; email: string; purpose: string };
  try { payload = verifyEmailToken<typeof payload>(token); }
  catch { throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400); }
  if (payload.purpose !== "reset") throw new AppError("Token tidak valid.", 400);
  const customer = await prisma.customer.findUnique({ where: { id: payload.userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);
  const password_hash = await hashPassword(newPassword);
  await prisma.customer.update({ where: { id: customer.id }, data: { password_hash, token_version: { increment: 1 } } });
  return { message: "Password berhasil diubah. Silakan login." };
};
