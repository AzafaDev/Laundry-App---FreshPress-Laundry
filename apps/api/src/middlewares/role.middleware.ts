import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";

export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Autentikasi diperlukan.", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Akses ditolak.", 403));
    }
    next();
  };
