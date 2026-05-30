import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";

const PROFILE_SELECT = {
  id: true,
  full_name: true,
  email: true,
  phone: true,
  avatar_url: true,
  role: true,
  outlet_id: true,
} as const;

export const getProfile = async (employeeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, deleted_at: null },
    select: PROFILE_SELECT,
  });
  if (!employee) throw new AppError("Akun tidak ditemukan.", 404);
  return employee;
};

export const updateProfile = async (
  employeeId: string,
  data: { full_name?: string; phone?: string },
) => {
  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data,
    select: PROFILE_SELECT,
  });
  return employee;
};

export const updateAvatar = async (employeeId: string, avatarUrl: string) => {
  const employee = await prisma.employee.update({
    where: { id: employeeId },
    data: { avatar_url: avatarUrl },
    select: PROFILE_SELECT,
  });
  return employee;
};
