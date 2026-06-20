import { Request, Response } from "express";
import type { z } from "zod";
import type { getMyLogsQuerySchema } from "../../validations/attendance.validation.js";
import { attendanceService } from "../../services/driver-worker/attendance.service.js";
import { requireUserId } from "../../utils/asyncHandler.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { getEmployeeOutlet } from "../../repositories/driver-worker/attendance.repository.js";
import { isWithinRadius } from "../../utils/distance.util.js";

type MyLogsQuery = z.infer<typeof getMyLogsQuerySchema>;

export const checkIn = async (req: Request, res: Response) => {
  const employeeId = requireUserId(req);
  const { lat, lng } = req.body;
  if (!lat || !lng) throw new AppError("Lokasi tidak tersedia. Aktifkan GPS untuk check-in.", 400);

  const outletId = await getEmployeeOutlet(employeeId);
  const withinRadius = await isWithinRadius(outletId, lat, lng);
  if (!withinRadius) throw new AppError("Anda harus berada di sekitar outlet untuk check-in.", 403);

  const attendance = await attendanceService.checkIn(employeeId, { lat, lng });
  res.status(201).json({ success: true, data: attendance });
};

export const checkOut = async (req: Request, res: Response) => {
  const employeeId = requireUserId(req);
  const { attendanceId } = req.body;
  const attendance = await attendanceService.checkOut(attendanceId, employeeId);
  res.json({ success: true, data: attendance });
};

export const getMyLogs = async (req: Request, res: Response) => {
  const employeeId = requireUserId(req);
  const { page, limit, startDate, endDate } = req.query as unknown as MyLogsQuery;
  const result = await attendanceService.getMyAttendanceLogs(employeeId, page, limit, startDate, endDate);
  res.json({ success: true, ...result });
};

export const checkTodayAttendance = async (req: Request, res: Response) => {
  const employeeId = requireUserId(req);
  const result = await attendanceService.checkTodayAttendance(employeeId);
  res.json({ success: true, data: result });
};

export const getCurrentShift = async (req: Request, res: Response) => {
  const employeeId = requireUserId(req);
  const shift = await attendanceService.getUpcomingOrActiveShift(employeeId);
  res.json({ success: true, data: shift });
};
