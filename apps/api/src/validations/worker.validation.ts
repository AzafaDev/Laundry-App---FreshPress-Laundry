import { z } from "zod";

export const submitItemsSchema = z.object({
  actual_items: z
    .array(
      z.object({
        clothing_type_id: z.string().uuid("clothing_type_id harus UUID yang valid."),
        actual_quantity: z.coerce
          .number()
          .int("Quantity harus bilangan bulat.")
          .nonnegative("Quantity tidak boleh negatif."),
      }),
    )
    .min(1, "Minimal satu item harus diisi."),
  actual_satuan_items: z
    .array(
      z.object({
        laundry_item_id: z.string().uuid("laundry_item_id harus UUID yang valid."),
        actual_quantity: z.coerce
          .number()
          .int("Quantity harus bilangan bulat.")
          .nonnegative("Quantity tidak boleh negatif."),
      }),
    )
    .optional(),
});

export const createBypassRequestSchema = z.object({
  order_id: z.string().uuid("order_id harus UUID yang valid."),
  discrepancy_description: z
    .string()
    .min(1, "Deskripsi ketidaksesuaian wajib diisi.")
    .max(1000, "Deskripsi maksimal 1000 karakter."),
  actual_items: z.string().min(1, "actual_items wajib diisi."),
  actual_satuan_items: z.string().optional(),
});
