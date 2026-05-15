// Admin report controller

import { NextFunction, Request, Response } from "express";
import { attendanceReportQuerySchema } from "../../validations/attendance.validation.js";
import { attendanceService } from "../../services/driver-worker/index.js";

export const getAttendanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { outletId, userId, startDate, endDate, page, limit } =
      attendanceReportQuerySchema.parse(req.query);

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await attendanceService.getAttendanceReport(
      outletId,
      userId,
      start,
      end,
      page,
      limit,
    );

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
