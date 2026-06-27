import { z } from "zod";

// HH:MM format for time fields
const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM (contoh: 08:00).");

export const createWorkShiftSchema = z.object({
  name: z.string().min(2, "Nama shift minimal 2 karakter.").max(50),
  start_time: timeSchema,
  end_time: timeSchema,
  description: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateWorkShiftSchema = z
  .object({
    name: z.string().min(2).max(50).optional(),
    start_time: timeSchema.optional(),
    end_time: timeSchema.optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Setidaknya satu field harus diubah.",
  });

export const assignEmployeeShiftSchema = z
  .object({
    shift_id: z.string().uuid("shift_id harus UUID."),
    outlet_id: z.string().uuid("outlet_id harus UUID."),
    // Recurring weekly (0=Sun … 6=Sat) — required when date is not set
    day_of_week: z.number().int().min(0).max(6).optional(),
    // One-time specific date — takes priority when provided
    date: z.string().date("Format tanggal harus YYYY-MM-DD.").optional(),
    is_active: z.boolean().optional().default(true),
  })
  .refine((d) => d.day_of_week !== undefined || d.date !== undefined, {
    message: "Harus mengisi day_of_week (recurring) atau date (tanggal spesifik).",
  })
  .refine((d) => !(d.day_of_week !== undefined && d.date !== undefined), {
    message: "Tidak boleh mengisi day_of_week dan date sekaligus.",
  });

export const listWorkShiftQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_active: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  include_deleted: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateWorkShiftInput = z.infer<typeof createWorkShiftSchema>;
export type UpdateWorkShiftInput = z.infer<typeof updateWorkShiftSchema>;
export type AssignEmployeeShiftInput = z.infer<typeof assignEmployeeShiftSchema> & {
  day_of_week?: number;
  date?: string;
};
export type ListWorkShiftQuery = z.infer<typeof listWorkShiftQuerySchema>;
