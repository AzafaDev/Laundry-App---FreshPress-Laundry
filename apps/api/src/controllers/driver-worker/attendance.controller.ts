import { NextFunction, Request, Response } from "express";
import {
  checkInSchema,
  checkOutSchema,
  getMyLogsQuerySchema,
} from "../../validations/attendance.validation.js";
import { attendanceService } from "../../services/driver-worker/index.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const checkIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);

    const { lat, lng } = checkInSchema.parse(req.body);
    const attendance = await attendanceService.checkIn(employeeId, {
      lat,
      lng,
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);

    const { attendanceId } = checkOutSchema.parse(req.body);
    const attendance = await attendanceService.checkOut(
      attendanceId,
      employeeId,
    );

    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

export const getMyLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);

    const { page, limit, startDate, endDate } = getMyLogsQuerySchema.parse(
      req.query,
    );
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await attendanceService.getMyAttendanceLogs(
      employeeId,
      page,
      limit,
      start,
      end,
    );

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const checkTodayAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);

    const result = await attendanceService.checkTodayAttendance(employeeId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCurrentShift = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);

    const shift = await attendanceService.getCurrentShift(employeeId);
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};
