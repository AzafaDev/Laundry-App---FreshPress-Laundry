import { z } from "zod";

export const checkInSchema = z.object({
  lat: z.coerce
    .number()
    .min(-90)
    .max(90)
    .optional()
    .refine((v) => v === undefined || !isNaN(v), "Latitude tidak valid"),
  lng: z.coerce
    .number()
    .min(-180)
    .max(180)
    .optional()
    .refine((v) => v === undefined || !isNaN(v), "Longitude tidak valid"),
});

export const checkOutSchema = z.object({
  attendanceId: z.string().uuid("ID absensi tidak valid"),
});

export const getMyLogsQuerySchema = z.object({
  startDate: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? undefined
        : new Date(`${val as string}T00:00:00+07:00`),
    z.date().optional(),
  ),
  endDate: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? undefined
        : new Date(`${val as string}T23:59:59+07:00`),
    z.date().optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ✅ Ubah userId → employeeId
export const attendanceReportQuerySchema = z.object({
  outletId: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z.string().uuid("Outlet ID tidak valid").optional(),
  ),
  employeeId: z.preprocess(
    // <-- perubahan di sini
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z.string().uuid("Employee ID tidak valid").optional(),
  ),
  status: z.enum(["on_time", "late", "absent"]).optional(),
  startDate: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? undefined
        : new Date(`${val as string}T00:00:00+07:00`),
    z.date().optional(),
  ),
  endDate: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? undefined
        : new Date(`${val as string}T23:59:59+07:00`),
    z.date().optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
