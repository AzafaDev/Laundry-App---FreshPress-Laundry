import { z } from "zod";

export const submitItemsSchema = z.object({
  actual_items: z
    .array(
      z.object({
        clothing_type_id: z.string().uuid("clothing_type_id harus UUID yang valid."),
        actual_quantity: z.coerce
          .number()
          .int("Quantity harus bilangan bulat.")
          .min(0, "Quantity tidak boleh negatif.")
          .max(99, "Quantity maksimal 99."),
      }),
    )
    .min(1, "Minimal satu item harus diisi.")
    .refine(
      (items) => items.some((i) => i.actual_quantity > 0),
      "Minimal satu item harus memiliki quantity lebih dari 0.",
    ),
  actual_satuan_items: z
    .array(
      z.object({
        laundry_item_id: z.string().uuid("laundry_item_id harus UUID yang valid."),
        actual_quantity: z.coerce
          .number()
          .int("Quantity harus bilangan bulat.")
          .min(0, "Quantity tidak boleh negatif.")
          .max(99, "Quantity maksimal 99."),
      }),
    )
    .optional(),
});

export const createBypassRequestSchema = z.object({
  order_id: z.string().uuid("order_id harus UUID yang valid."),
  discrepancy_description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(255, "Deskripsi maksimal 255 karakter.")
    .regex(/\S/, "Deskripsi tidak boleh hanya spasi."),
  actual_items: z.string().min(1, "actual_items wajib diisi."),
  actual_satuan_items: z.string().optional(),
});
