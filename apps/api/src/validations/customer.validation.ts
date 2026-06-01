import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/).optional(),
  role: z.enum(["customer", "driver", "worker"]).optional().default("customer"),
});

export const verifySchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const emailSchema = z.object({ email: z.string().email() });

export const resetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/).optional(),
  new_email: z.string().email().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z
    .string()
    .min(8, "Password minimal 8 karakter.")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
    .regex(/\d/, "Password harus mengandung angka."),
});

export const verifyEmailChangeSchema = z.object({
  token: z.string().min(1, "Token tidak boleh kosong."),
});
