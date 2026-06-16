import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.util.js";
import {
  signAccessToken,
  signRefreshToken,
  signEmailToken,
  verifyEmailToken,
  verifyRefreshToken,
} from "../../utils/jwt.util.js";
import { parseDuration, storeRefreshToken, revokeRefreshToken, hashToken } from "../../utils/token.util.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { env } from "../../config/env.js";

const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as "none" | "strict",
  maxAge,
});

function issueTokenCookies(
  res: Response,
  payload: { userId: string; role: string; email: string; tokenVersion: number },
) {
  const accessExpiresMs = parseDuration(process.env.JWT_EXPIRES_IN || "15m");
  const refreshExpiresMs = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN || "7d");

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie("accessToken", accessToken, COOKIE_OPTS(accessExpiresMs));
  res.cookie("refreshToken", refreshToken, COOKIE_OPTS(refreshExpiresMs));

  const expiresAt = new Date(Date.now() + refreshExpiresMs);
  storeRefreshToken(payload.userId, refreshToken, expiresAt, "customer");
}

/** Register new customer – no password at this step */
export const registerCustomer = async (data: {
  full_name: string;
  email: string;
  phone?: string;
}) => {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Email sudah terdaftar.", 409);

  const tempHash = await hashPassword(crypto.randomBytes(16).toString("hex"));

  const customer = await prisma.customer.create({
    data: {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? "",
      password_hash: tempHash,
      is_verified: false,
    },
  });

  const token = signEmailToken(
    { userId: customer.id, email: customer.email, purpose: "verify" },
    "1h",
  );
  try {
    await sendVerificationEmail(customer.email, token);
  } catch (emailErr) {
    console.error("[registerCustomer] Failed to send verification email:", emailErr);
  }
  return { message: "Email verifikasi telah dikirim." };
};

/** Resend verification email */
export const resendVerification = async (email: string) => {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) throw new AppError("Email tidak ditemukan.", 404);
  if (customer.is_verified) throw new AppError("Akun sudah terverifikasi.", 400);

  const token = signEmailToken({ userId: customer.id, email, purpose: "verify" }, "1h");
  await sendVerificationEmail(email, token);
  return { message: "Email verifikasi telah dikirim ulang." };
};

/** Verify email and set password */
export const verifyEmailAndSetPassword = async (token: string, password: string) => {
  let payload: { userId: string; email: string; purpose: string };
  try {
    payload = verifyEmailToken<typeof payload>(token);
  } catch {
    throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400);
  }

  if (payload.purpose !== "verify") throw new AppError("Token tidak valid.", 400);

  const customer = await prisma.customer.findUnique({ where: { id: payload.userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);
  if (customer.is_verified) throw new AppError("Akun sudah pernah diverifikasi.", 400);

  const password_hash = await hashPassword(password);
  await prisma.customer.update({
    where: { id: customer.id },
    data: { is_verified: true, password_hash },
  });

  return { message: "Akun berhasil diverifikasi. Silakan login." };
};

/** Login with email + password */
export const loginCustomer = async (email: string, password: string, res: Response) => {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) throw new AppError("Email atau password salah.", 401);
  if (!customer.password_hash) throw new AppError("Email atau password salah.", 401);

  const valid = await comparePassword(password, customer.password_hash);
  if (!valid) throw new AppError("Email atau password salah.", 401);

  if (!customer.is_verified) throw new AppError("Akun belum diverifikasi.", 403);

  issueTokenCookies(res, {
    userId: customer.id,
    role: "customer",
    email: customer.email,
    tokenVersion: customer.token_version,
  });

  const { password_hash: _, ...safeCustomer } = customer;
  return { user: safeCustomer };
};

/** Refresh customer access token */
export const refreshCustomerToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new AppError("Refresh token tidak ditemukan.", 401);

  let payload: { userId: string; role: string; email: string; tokenVersion?: number };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Refresh token tidak valid atau kadaluarsa.", 401);
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: hashToken(refreshToken),
      user_type: "customer",
      user_id: payload.userId,
      revoked_at: null,
      expires_at: { gt: new Date() },
    },
  });

  if (!storedToken) throw new AppError("Refresh token tidak valid.", 401);

  await revokeRefreshToken(refreshToken);

  const customer = await prisma.customer.findFirst({
    where: { id: payload.userId, deleted_at: null },
    select: { id: true, token_version: true },
  });

  if (!customer) throw new AppError("Akun tidak ditemukan.", 401);

  issueTokenCookies(res, {
    userId: customer.id,
    role: "customer",
    email: payload.email,
    tokenVersion: customer.token_version,
  });

  return {};
};

/** Logout customer */
export const logoutCustomer = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie("accessToken", COOKIE_OPTS(0));
  res.clearCookie("refreshToken", COOKIE_OPTS(0));

  return { message: "Logout berhasil." };
};

/** Forgot password – send reset email */
export const forgotPassword = async (email: string) => {
  const customer = await prisma.customer.findFirst({ where: { email, deleted_at: null } });
  if (!customer || !customer.is_verified) {
    return { message: "Jika email terdaftar, link reset akan dikirimkan." };
  }

  const token = signEmailToken(
    {
      userId: customer.id,
      email: customer.email,
      purpose: "reset",
      nonce: crypto.randomBytes(8).toString("hex"),
    },
    "1h",
  );

  await sendResetPasswordEmail(customer.email, token);
  return { message: "Jika email terdaftar, link reset akan dikirimkan." };
};

/** Confirm reset password */
export const resetPassword = async (token: string, newPassword: string) => {
  let payload: { userId: string; email: string; purpose: string };
  try {
    payload = verifyEmailToken<typeof payload>(token);
  } catch {
    throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400);
  }

  if (payload.purpose !== "reset") throw new AppError("Token tidak valid.", 400);

  const customer = await prisma.customer.findUnique({ where: { id: payload.userId } });
  if (!customer) throw new AppError("User tidak ditemukan.", 404);

  const password_hash = await hashPassword(newPassword);
  await prisma.customer.update({
    where: { id: customer.id },
    data: { password_hash, token_version: { increment: 1 } },
  });

  return { message: "Password berhasil diubah. Silakan login." };
};

/* ------------------------------------------------------------------ */
/*  Google OAuth                                                        */
/* ------------------------------------------------------------------ */

const getGoogleCallbackUrl = () =>
  `${env.API_URL}/api/v1/customer/auth/google/callback`;

export const getGoogleAuthUrl = (): string => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError("Google OAuth belum dikonfigurasi.", 501);
  }
  const client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    getGoogleCallbackUrl(),
  );
  return client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
};

export const googleLogin = async (code: string, res: Response) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError("Google OAuth belum dikonfigurasi.", 501);
  }
  const client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    getGoogleCallbackUrl(),
  );

  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) throw new AppError("Token Google tidak valid.", 400);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const oauthPayload = ticket.getPayload();
  if (!oauthPayload?.email) throw new AppError("Tidak ada email dari Google.", 400);

  let customer = await prisma.customer.findUnique({ where: { email: oauthPayload.email } });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        email: oauthPayload.email,
        full_name: oauthPayload.name ?? oauthPayload.email,
        phone: "",
        password_hash: await hashPassword(crypto.randomBytes(16).toString("hex")),
        is_verified: true,
        avatar_url: oauthPayload.picture ?? null,
      },
    });
  } else if (!customer.is_verified) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { is_verified: true },
    });
  }

  issueTokenCookies(res, {
    userId: customer.id,
    role: "customer",
    email: customer.email,
    tokenVersion: customer.token_version,
  });

  const { password_hash: _, ...safeCustomer } = customer;
  return { user: safeCustomer };
};
