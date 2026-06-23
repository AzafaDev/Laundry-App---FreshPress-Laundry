import { z } from "zod";

const latitudeSchema = z
  .number()
  .min(-90, "Latitude harus antara -90 dan 90.")
  .max(90, "Latitude harus antara -90 dan 90.");

const longitudeSchema = z
  .number()
  .min(-180, "Longitude harus antara -180 dan 180.")
  .max(180, "Longitude harus antara -180 dan 180.");

const phoneSchema = z
  .string({ error: "Nomor telepon wajib diisi." })
  .regex(/^[0-9+\-\s]{8,15}$/, "Nomor telepon tidak valid.");

export const createOutletSchema = z.object({
  name: z.string().min(2, "Nama outlet minimal 2 karakter."),
  address: z.string().min(5, "Alamat minimal 5 karakter."),
  province: z.string().min(2, "Provinsi wajib diisi."),
  city: z.string().min(2, "Kota / Kabupaten wajib diisi."),
  district: z.string().min(2, "Kecamatan wajib diisi."),
  postal_code: z.string().optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  service_radius_km: z
    .number({ error: "Radius layanan wajib diisi." })
    .positive("Radius layanan harus lebih dari 0.")
    .max(100, "Radius layanan maksimal 100 km."),
  is_active: z.boolean().optional().default(true),
});

export const updateOutletSchema = z.object({
  name: z.string().min(2, "Nama outlet minimal 2 karakter.").optional(),
  address: z.string().min(5, "Alamat minimal 5 karakter.").optional(),
  province: z.string().min(2, "Provinsi wajib diisi.").optional(),
  city: z.string().min(2, "Kota / Kabupaten wajib diisi.").optional(),
  district: z.string().min(2, "Kecamatan wajib diisi.").optional(),
  postal_code: z.string().optional(),
  phone: phoneSchema.optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  service_radius_km: z
    .number()
    .positive("Radius layanan harus lebih dari 0.")
    .max(100, "Radius layanan maksimal 100 km.")
    .optional(),
  is_active: z.boolean().optional(),
  re_geocode: z.boolean().optional(),
});

export const listOutletQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  is_active: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  include_deleted: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});

export const assignUserToOutletSchema = z.object({
  user_id: z.string().uuid("user_id harus UUID."),
});

export type CreateOutletInput = z.infer<typeof createOutletSchema>;
export type UpdateOutletInput = z.infer<typeof updateOutletSchema>;
export type ListOutletQuery = z.infer<typeof listOutletQuerySchema>;
