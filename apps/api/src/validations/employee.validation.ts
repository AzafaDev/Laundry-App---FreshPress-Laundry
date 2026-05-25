import { z } from "zod";

export const loginEmployeeSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi"),
});

