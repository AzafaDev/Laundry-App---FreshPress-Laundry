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

export const createAddressSchema = z.object({
  label: z.string().min(1, "Label wajib diisi.").max(50),
  address: z.string().min(5, "Alamat lengkap wajib diisi."),
  province: z.string().min(2, "Provinsi wajib diisi.").max(100),
  city: z.string().min(2, "Kota wajib diisi.").max(100),
  district: z.string().min(2, "Kecamatan wajib diisi.").max(100),
  postal_code: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit angka.").optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  is_primary: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
