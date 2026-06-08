import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util.js";
import { AppError } from "./error.middleware.js";
import { prisma } from "../lib/prisma.js";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userType = req.headers["x-user-type"] as string | undefined;
    let token: string | undefined;

    if (userType === "employee") {
      token = req.cookies?.accessToken;
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      throw new AppError("Autentikasi diperlukan.", 401);
    }
    const payload = verifyAccessToken(token);

    let userExists = false;

    if (userType === "employee" || payload.role !== "customer") {
      const employee = await prisma.employee.findFirst({
        where: { id: payload.userId, deleted_at: null },
        select: { id: true, token_version: true },
      });
      if (employee && payload.tokenVersion !== undefined && employee.token_version !== payload.tokenVersion) {
        throw new AppError("Sesi tidak valid. Silakan login kembali.", 401);
      }
      userExists = !!employee;
    } else {
      const customer = await prisma.customer.findFirst({
        where: { id: payload.userId, deleted_at: null },
        select: { id: true },
      });
      userExists = !!customer;
    }

    if (!userExists) {
      throw new AppError("Akun tidak ditemukan atau telah dinonaktifkan.", 401);
    }

    req.user = payload;
    next();
  } catch {
    next(new AppError("Token tidak valid atau kadaluarsa.", 401));
  }
};
