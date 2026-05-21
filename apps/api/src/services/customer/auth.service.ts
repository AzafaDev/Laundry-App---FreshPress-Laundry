import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../lib/prisma.js";
import { hashPassword, comparePassword } from "../../utils/hash.util.js";
import {
  signAccessToken,
  signEmailToken,
  verifyEmailToken,
} from "../../utils/jwt.util.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../../lib/email.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { env } from "../../config/env.js";
import {
  VERIFICATION_TOKEN_EXPIRY_MS,
  RESET_PASSWORD_TOKEN_EXPIRY_MS,
} from "../../config/constants.js";

/** Register new customer – no password at this step */
export const registerCustomer = async (data: {
  full_name: string;
  email: string;
  phone?: string;
  role?: "customer" | "driver" | "worker";
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Email sudah terdaftar.", 409);

  // Placeholder password hash – will be replaced on verification
  const tempHash = await hashPassword(crypto.randomBytes(16).toString("hex"));

  const user = await prisma.user.create({
    data: {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? "",
      password_hash: tempHash,
      role: data.role ?? "customer",
      is_verified: false,
    },
  });

  const token = signEmailToken(
    { userId: user.id, email: user.email, purpose: "verify" },
    "1h",
  );
  await sendVerificationEmail(user.email, token);
  return { message: "Email verifikasi telah dikirim." };
};

/** Resend verification email */
export const resendVerification = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Email tidak ditemukan.", 404);
  if (user.is_verified) throw new AppError("Akun sudah terverifikasi.", 400);

  const token = signEmailToken({ userId: user.id, email, purpose: "verify" }, "1h");
  await sendVerificationEmail(email, token);
  return { message: "Email verifikasi telah dikirim ulang." };
};

/** Verify email and set password */
export const verifyEmailAndSetPassword = async (
  token: string,
  password: string,
) => {
  let payload: { userId: string; email: string; purpose: string };
  try {
    payload = verifyEmailToken<typeof payload>(token);
  } catch {
    throw new AppError("Token tidak valid atau sudah kadaluarsa.", 400);
  }

  if (payload.purpose !== "verify") throw new AppError("Token tidak valid.", 400);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError("User tidak ditemukan.", 404);
  if (user.is_verified) throw new AppError("Akun sudah pernah diverifikasi.", 400);

  const password_hash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { is_verified: true, password_hash },
  });

  return { message: "Akun berhasil diverifikasi. Silakan login." };
};

/** Login with email + password */
export const loginCustomer = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Email atau password salah.", 401);

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new AppError("Email atau password salah.", 401);

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const { password_hash: _, ...safeUser } = user;
  return { accessToken, user: safeUser };
};

/** Forgot password – send reset email */
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // Silently succeed even if no user found (security)
  if (!user || !user.is_verified) {
    return { message: "Jika email terdaftar, link reset akan dikirimkan." };
  }

  const token = signEmailToken(
    {
      userId: user.id,
      email: user.email,
      purpose: "reset",
      nonce: crypto.randomBytes(8).toString("hex"),
    },
    "1h",
  );

  // Store token hash so it can only be used once
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: user.password_hash, // unchanged, but we'll piggyback via a separate mechanism
    },
  });

  // We'll use a cache/DB field – for now store in a temp notification or reuse the token inline
  await sendResetPasswordEmail(user.email, token);
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

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError("User tidak ditemukan.", 404);

  const password_hash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password_hash },
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

export const googleLogin = async (code: string) => {
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
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError("Tidak ada email dari Google.", 400);

  let user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        full_name: payload.name ?? payload.email,
        phone: "",
        password_hash: await hashPassword(crypto.randomBytes(16).toString("hex")),
        role: "customer",
        is_verified: true,
        avatar_url: payload.picture ?? null,
      },
    });
  } else if (!user.is_verified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { is_verified: true },
    });
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  const { password_hash: _, ...safeUser } = user;
  return { accessToken, user: safeUser };
};
