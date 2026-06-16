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

export const createOrderSchema = z.object({
  pickup_address_id: z.string().uuid("Alamat pickup tidak valid."),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal pickup tidak valid."),
  service_type: z.enum(["wash-and-fold", "dry-cleaning"]),
  estimated_weight_kg: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const listOrdersQuerySchema = z.object({
  status: z
    .enum([
      "waiting_pickup_driver",
      "laundry_to_outlet",
      "laundry_arrived_outlet",
      "washing",
      "ironing",
      "packing",
      "waiting_payment",
      "ready_for_delivery",
      "delivery_to_customer",
      "received_by_customer",
      "completed",
    ])
    .optional(),
  search: z.string().max(100).optional(),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createComplaintSchema = z.object({
  complaint_type: z.enum([
    "missing_item",
    "damaged_item",
    "wrong_item",
    "late_delivery",
    "quality_issue",
    "other",
  ]),
  description: z.string().min(10, "Deskripsi minimal 10 karakter.").max(1000),
});
