import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.util.js";
import { Response } from "express";

async function storeRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
) {
  return prisma.refreshToken.create({
    data: {
      user_type: "employee",
      user_id: userId,
      token,
      expires_at: expiresAt,
    },
  });
}

async function revokeRefreshToken(token: string) {
  return prisma.refreshToken.updateMany({
    where: { token, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export const loginEmployee = async (
  email: string,
  password: string,
  res: Response,
) => {
  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee) {
    throw new AppError("Email atau password salah.", 401);
  }

  const isValid = await bcrypt.compare(password, employee.password_hash);
  if (!isValid) {
    throw new AppError("Email atau password salah.", 401);
  }

  const accessToken = signAccessToken({
    userId: employee.id,
    role: employee.role,
    email: employee.email,
  });

  const refreshToken = signRefreshToken({
    userId: employee.id,
    role: employee.role,
    email: employee.email,
  });

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const expiresMs = parseDuration(expiresIn);
  const expiresAt = new Date(Date.now() + expiresMs);

  await storeRefreshToken(employee.id, refreshToken, expiresAt);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: expiresMs,
  });

  const { password_hash: _, ...employeeWithoutPassword } = employee;

  return { accessToken, employee: employeeWithoutPassword };
};

export const refreshEmployeeToken = async (req: any, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new AppError("Refresh token tidak ditemukan", 401);
  }

  let payload: { userId: string; role: string; email: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Refresh token tidak valid atau kadaluarsa");
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      user_type: "employee",
      user_id: payload.userId,
      revoked_at: null,
      expires_at: { gt: new Date() },
    },
  });

  if (!storedToken) {
    throw new AppError("Refresh token tidak valid", 401);
  }

  await revokeRefreshToken(refreshToken);

  const newAccessToken = signAccessToken({
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
  });

  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
    role: payload.role,
    email: payload.email,
  });

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const expiresMs = parseDuration(expiresIn);
  const expiresAt = new Date(Date.now() + expiresMs);

  await storeRefreshToken(payload.userId, newRefreshToken, expiresAt);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: expiresMs,
  });

  return { accessToken: newAccessToken };
};

export const logoutEmployee = async (req: any, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return { message: "Logout berhasil"}
};

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhm])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
