import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = {
  userId: string;
  role: string;
  email: string;
  outletId?: string | null;
};

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as any);
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as any);
};

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;

export const signEmailToken = (
  payload: object,
  expiresIn: string | number = "1h",
): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as any);
};

export const verifyEmailToken = <T extends object>(token: string): T =>
  jwt.verify(token, env.JWT_SECRET) as T;
