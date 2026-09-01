import { z } from "zod";

export const processOrderSchema = z
  .object({
    // 0 diperbolehkan bila order hanya berisi item satuan (tanpa kiloan)
    total_weight_kg: z.coerce
      .number({ message: "Berat total harus berupa angka." })
      .min(0, "Berat tidak boleh negatif.")
      .max(999.99, "Berat maksimal 999.99 kg.")
      .default(0),
    items: z
      .array(
        z.object({
          laundry_item_id: z.string().uuid("laundry_item_id harus UUID yang valid."),
          quantity: z.coerce
            .number()
            .positive("Quantity harus lebih dari 0.")
            .int("Quantity harus bilangan bulat."),
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
  })
  .superRefine((data, ctx) => {
    const hasAnyItem = data.items.some((i) => i.quantity > 0);
    if (!hasAnyItem) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimal satu item (kiloan atau satuan) harus memiliki quantity lebih dari 0.",
        path: ["items"],
      });
    }

    // Berat kiloan harus bilangan bulat
    if (data.total_weight_kg > 0 && !Number.isInteger(data.total_weight_kg)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Berat kiloan harus bilangan bulat (tidak boleh desimal seperti 0.5).",
        path: ["total_weight_kg"],
      });
    }

    const hasBreakdown = (data.breakdown ?? []).some((b) => b.quantity > 0);

    // Jika breakdown diisi, harus ada berat kiloan
    if (hasBreakdown && data.total_weight_kg === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rincian jenis pakaian diisi, tetapi berat kiloan masih 0.",
        path: ["breakdown"],
      });
    }

    // Jika berat kiloan > 0, breakdown wajib diisi
    if (data.total_weight_kg > 0 && !hasBreakdown) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Berat kiloan sudah diisi. Wajib mengisi rincian jenis pakaian.",
        path: ["breakdown"],
      });
    }
  });

export const reviewBypassSchema = z.object({
  action: z.enum(["approve", "reject"] as const, {
    message: "Action harus 'approve' atau 'reject'.",
  }),
  admin_notes: z.string().max(500, "Catatan admin maksimal 500 karakter.").optional(),
});
