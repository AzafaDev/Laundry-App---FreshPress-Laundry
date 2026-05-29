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
}) => {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Email sudah terdaftar.", 409);

  // Placeholder password hash – will be replaced on verification
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
export const loginCustomer = async (email: string, password: string) => {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) throw new AppError("Email atau password salah.", 401);
  if (!customer.password_hash) throw new AppError("Email atau password salah.", 401);

  const valid = await comparePassword(password, customer.password_hash);
  if (!valid) throw new AppError("Email atau password salah.", 401);

  const accessToken = signAccessToken({
    userId: customer.id,
    role: "customer",
    email: customer.email,
  });

  const { password_hash: _, ...safeCustomer } = customer;
  return { accessToken, user: safeCustomer };
};

/** Forgot password – send reset email */
export const forgotPassword = async (email: string) => {
  const customer = await prisma.customer.findUnique({ where: { email } });
  // Silently succeed even if no user found (security)
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

  let customer = await prisma.customer.findUnique({ where: { email: payload.email } });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        email: payload.email,
        full_name: payload.name ?? payload.email,
        phone: "",
        password_hash: await hashPassword(crypto.randomBytes(16).toString("hex")),
        is_verified: true,
        avatar_url: payload.picture ?? null,
      },
    });
  } else if (!customer.is_verified) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { is_verified: true },
    });
  }

  const accessToken = signAccessToken({
    userId: customer.id,
    role: "customer",
    email: customer.email,
  });

  const { password_hash: _, ...safeCustomer } = customer;
  return { accessToken, user: safeCustomer };
};
