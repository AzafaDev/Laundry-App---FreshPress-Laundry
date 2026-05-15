// apps/api/src/lib/jwt.ts
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export type UserRole =
  | 'customer'
  | 'super_admin'
  | 'outlet_admin'
  | 'worker'
  | 'driver';

export interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
