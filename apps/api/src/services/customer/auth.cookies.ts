import { Response } from "express";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.util.js";
import { parseDuration, storeRefreshToken } from "../../utils/token.util.js";

export const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict") as "none" | "strict",
  maxAge,
});

export function issueTokenCookies(
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
