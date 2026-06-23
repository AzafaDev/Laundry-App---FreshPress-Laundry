import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../utils/hash.util.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { env } from "../../config/env.js";
import { issueTokenCookies } from "./auth.cookies.js";

const getGoogleCallbackUrl = () => `${env.API_URL}/api/v1/customer/auth/google/callback`;

export const getGoogleAuthUrl = (): string => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError("Google OAuth belum dikonfigurasi.", 501);
  }
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, getGoogleCallbackUrl());
  return client.generateAuthUrl({ access_type: "offline", scope: ["openid", "email", "profile"], prompt: "select_account" });
};

export const googleLogin = async (code: string, res: Response) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError("Google OAuth belum dikonfigurasi.", 501);
  }
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, getGoogleCallbackUrl());

  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) throw new AppError("Token Google tidak valid.", 400);

  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: env.GOOGLE_CLIENT_ID });
  const oauthPayload = ticket.getPayload();
  if (!oauthPayload?.email) throw new AppError("Tidak ada email dari Google.", 400);

  const providerUid = oauthPayload.sub;
  if (!providerUid) throw new AppError("Google user ID tidak tersedia.", 400);

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
    customer = await prisma.customer.update({ where: { id: customer.id }, data: { is_verified: true } });
  }

  // Simpan / update entri SocialAccount agar bisa dideteksi sebagai Google user
  await prisma.socialAccount.upsert({
    where: { provider_provider_uid: { provider: "google", provider_uid: providerUid } },
    update: { customer_id: customer.id },
    create: { customer_id: customer.id, provider: "google", provider_uid: providerUid },
  });

  issueTokenCookies(res, { userId: customer.id, role: "customer", email: customer.email, tokenVersion: customer.token_version });

  const { password_hash: _, ...safeCustomer } = customer;
  return { user: { ...safeCustomer, has_google_login: true } };
};
