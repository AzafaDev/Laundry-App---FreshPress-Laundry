import { z } from "zod";

export const processOrderSchema = z.object({
  // 0 diperbolehkan untuk order pcs-only (tidak ada item kiloan)
  total_weight_kg: z.coerce
    .number({ message: "Berat total harus berupa angka." })
    .min(0, "Berat tidak boleh negatif.")
    .max(999.99, "Berat maksimal 999.99 kg.")
    .default(0),
  items: z
    .array(
      z.object({
        laundry_item_id: z.string().uuid("laundry_item_id harus UUID yang valid."),
        quantity: z.coerce.number().int().positive("Quantity harus lebih dari 0."),
      }),
    )
    .min(1, "Minimal satu item laundry harus diisi."),
  breakdown: z
    .array(
      z.object({
        clothing_type_id: z.string().uuid("clothing_type_id harus UUID yang valid."),
        quantity: z.coerce.number().int().positive("Quantity harus lebih dari 0."),
      }),
    )
    .optional(),
  notes: z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
});

export const reviewBypassSchema = z.object({
  action: z.enum(["approve", "reject"] as const, {
    message: "Action harus 'approve' atau 'reject'.",
  }),
  admin_notes: z.string().max(500, "Catatan admin maksimal 500 karakter.").optional(),
});
