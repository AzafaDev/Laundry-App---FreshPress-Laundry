import crypto from "crypto";
import type { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, type TokenPayload } from "./jwt.util.js";

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhm])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "d": return value * 24 * 60 * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "m": return value * 60 * 1000;
    default:  return 7 * 24 * 60 * 60 * 1000;
  }
}

export function storeRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
  userType: string,
) {
  return prisma.refreshToken.create({
    data: { user_type: userType, user_id: userId, token: hashToken(token), expires_at: expiresAt },
  });
}

export function revokeRefreshToken(token: string) {
  return prisma.refreshToken.updateMany({
    where: { token: hashToken(token), revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export function buildAuthCookieOptions(maxAgeMs?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as "none" | "strict",
    ...(maxAgeMs !== undefined && { maxAge: maxAgeMs }),
  };
}

export async function issueAuthTokens(res: Response, payload: TokenPayload) {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresMs = parseDuration(process.env.JWT_REFRESH_EXPIRES_IN || "7d");
  const accessExpiresMs = parseDuration(process.env.JWT_EXPIRES_IN || "15m");

  await storeRefreshToken(payload.userId, refreshToken, new Date(Date.now() + expiresMs), "employee");

  res.cookie("accessToken", accessToken, buildAuthCookieOptions(accessExpiresMs));
  res.cookie("refreshToken", refreshToken, buildAuthCookieOptions(expiresMs));
}
