import { z } from "zod";

export const checkInSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const checkOutSchema = z.object({
  attendanceId: z.string().uuid("ID absensi tidak valid"),
});

export const getMyLogsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const attendanceReportQuerySchema = z.object({
  outletId: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z.string().uuid("Outlet ID tidak valid").optional(),
  ),
  userId: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : val,
    z.string().uuid("User ID tidak valid").optional(),
  ),
  startDate: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? undefined
        : new Date(val as string),
    z.date().optional(),
  ),
  endDate: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined
        ? undefined
        : new Date(val as string),
    z.date().optional(),
  ),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
