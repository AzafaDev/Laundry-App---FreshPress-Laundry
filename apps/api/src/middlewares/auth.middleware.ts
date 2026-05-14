import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { AppError } from "./error.middleware.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Autentikasi diperlukan.", 401);
    }
    const token = authHeader.slice(7);
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Token tidak valid atau kadaluarsa.", 401));
  }
};
