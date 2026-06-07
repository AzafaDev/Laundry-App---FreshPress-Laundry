import { z } from "zod";

const emptyToUndefined = (val: unknown) =>
  val === "" || val === null || val === undefined ? undefined : val;

const dateStart = z.preprocess(
  (val) => (emptyToUndefined(val) === undefined ? undefined : new Date(`${val}T00:00:00+07:00`)),
  z.date().optional(),
);
const dateEnd = z.preprocess(
  (val) => (emptyToUndefined(val) === undefined ? undefined : new Date(`${val}T23:59:59+07:00`)),
  z.date().optional(),
);

export const checkInSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
});

export const checkOutSchema = z.object({
  attendanceId: z.string().uuid("ID absensi tidak valid"),
});

export const getMyLogsQuerySchema = z.object({
  startDate: dateStart,
  endDate: dateEnd,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const attendanceReportQuerySchema = z.object({
  outletId: z.preprocess(emptyToUndefined, z.string().uuid("Outlet ID tidak valid").optional()),
  employeeId: z.preprocess(emptyToUndefined, z.string().uuid("Employee ID tidak valid").optional()),
  status: z.enum(["on_time", "late", "absent"]).optional(),
  startDate: dateStart,
  endDate: dateEnd,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
