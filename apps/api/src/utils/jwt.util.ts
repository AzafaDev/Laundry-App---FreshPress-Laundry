// JWT utilities
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/express.js";
import { env } from "../config/env.js";

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
