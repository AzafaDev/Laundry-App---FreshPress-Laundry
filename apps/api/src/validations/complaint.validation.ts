import { z } from "zod";

export const updateComplaintStatusSchema = z.object({
  status: z.enum(["in_progress", "resolved", "rejected"] as const, {
    message: "Status harus 'in_progress', 'resolved', atau 'rejected'.",
  }),
  resolution_notes: z
    .string()
    .max(1000, "Catatan resolusi maksimal 1000 karakter.")
    .optional(),
  expected_resolution_date: z.string().optional(),
});
