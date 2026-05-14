import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = {
  userId: string;
  role: string;
  email: string;
};

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as string });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as string });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;

export const signEmailToken = (payload: object, expiresIn = "1h"): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as string });

export const verifyEmailToken = <T extends object>(token: string): T =>
  jwt.verify(token, env.JWT_SECRET) as T;
