import { z } from "zod";

export const loginEmployeeSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi").max(64, "Password maksimal 64 karakter."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi."),
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .max(64, "Password maksimal 64 karakter.")
    .regex(/\S/, "Password tidak boleh hanya spasi.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi."),
  newPassword: z
    .string()
    .min(8, "Password baru minimal 8 karakter.")
    .max(64, "Password maksimal 64 karakter.")
    .regex(/\S/, "Password tidak boleh hanya spasi.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, "Nama lengkap wajib diisi.")
    .max(100, "Nama maksimal 100 karakter.")
    .regex(/\S/, "Nama tidak boleh hanya spasi.")
    .optional(),
  phone: z
    .string()
    .regex(/^(?=.*\d)[0-9+\-\s]{8,20}$/, "Nomor telepon tidak valid."),
});

