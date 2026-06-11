import { z } from "zod";

export const createLaundryItemSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi.").max(100),
  description: z.string().optional(),
  unit: z.string().default("pcs"),
  base_price: z.coerce
    .number()
    .positive("Harga harus lebih dari 0.")
    .max(99_999_999.99, "Harga terlalu besar."),
  is_active: z.boolean().optional().default(true),
});

export const updateLaundryItemSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional().nullable(),
    unit: z.string().optional(),
    base_price: z.coerce.number().positive().max(99_999_999.99).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Minimal satu field harus diubah.",
  });

export const listLaundryItemQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  is_active: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  sort_by: z.enum(["name", "base_price"]).optional().default("name"),
  sort_dir: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type CreateLaundryItemInput = z.infer<typeof createLaundryItemSchema>;
export type UpdateLaundryItemInput = z.infer<typeof updateLaundryItemSchema>;
export type ListLaundryItemQuery = z.infer<typeof listLaundryItemQuerySchema>;
