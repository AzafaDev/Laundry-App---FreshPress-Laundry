import { z } from "zod";

export const loginEmployeeSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi."),
  newPassword: z.string().min(8, "Password minimal 8 karakter."),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi."),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter."),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap wajib diisi.").max(100).optional(),
  phone: z.string().max(20).optional(),
});

