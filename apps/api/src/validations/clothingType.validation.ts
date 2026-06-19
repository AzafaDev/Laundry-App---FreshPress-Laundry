import { z } from "zod";

export const createClothingTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi.")
    .max(100, "Nama maksimal 100 karakter.")
    .trim(),
  is_active: z.boolean().optional().default(true),
});

export const updateClothingTypeSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi.").max(100, "Nama maksimal 100 karakter.").trim().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diubah.",
  });
