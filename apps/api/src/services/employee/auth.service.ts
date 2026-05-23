import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { signAccessToken } from "../../utils/jwt.util.js";

export const loginEmployee = async (email: string, password: string) => {
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

  const { password_hash: _, ...employeeWithoutPassword } = employee;

  return { accessToken, employee: employeeWithoutPassword };
};
