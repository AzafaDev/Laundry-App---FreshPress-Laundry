import { z } from "zod";

// Matches the EmployeeRole enum in schema.prisma
export const employeeRoleSchema = z.enum([
  "super_admin",
  "outlet_admin",
  "washing_worker",
  "ironing_worker",
  "packing_worker",
  "driver",
]);

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .regex(/[a-zA-Z]/, "Password harus mengandung huruf.")
  .regex(/\d/, "Password harus mengandung angka.");

export const createUserSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Format email tidak valid."),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/, "Format nomor telepon tidak valid.")
    .optional(),
  role: employeeRoleSchema,
  outlet_id: z.string().uuid("outlet_id harus UUID.").optional(),
  // password is now optional — if omitted, an invite email is sent
  password: passwordSchema.optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateUserSchema = z
  .object({
    full_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^[0-9+\-\s]{8,15}$/).optional(),
    role: employeeRoleSchema.optional(),
    outlet_id: z.string().uuid().nullable().optional(),
    is_active: z.boolean().optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diubah.",
  });

export const listUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  role: employeeRoleSchema.optional(),
  search: z.string().trim().optional(),
  outlet_id: z.string().uuid().optional(),
  include_deleted: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUserQuery = z.infer<typeof listUserQuerySchema>;
