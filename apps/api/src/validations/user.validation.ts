import { z } from "zod";

// ── Shared shape ──────────────────────────────────────────────────────────────
export const userRoleSchema = z.enum([
  "customer",
  "super_admin",
  "outlet_admin",
  "worker",
  "driver",
]);

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
  .regex(/\d/, "Password harus mengandung angka.");

// ── Body ──────────────────────────────────────────────────────────────────────
// Admin-create payload. `password` is optional — leaving it blank triggers the
// invite flow (verification email; user sets their own password on first
// click).
export const createUserSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/, "Format nomor telepon tidak valid."),
  role: userRoleSchema,
  password: passwordSchema.optional(),
  is_verified: z.boolean().optional().default(true),
});

export const updateUserSchema = z
  .object({
    full_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^[0-9+\-\s]{8,15}$/).optional(),
    role: userRoleSchema.optional(),
    is_verified: z.boolean().optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diubah.",
  });

// ── Query ─────────────────────────────────────────────────────────────────────
export const listUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  role: userRoleSchema.optional(),
  search: z.string().trim().optional(),
  include_deleted: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUserQuery = z.infer<typeof listUserQuerySchema>;
