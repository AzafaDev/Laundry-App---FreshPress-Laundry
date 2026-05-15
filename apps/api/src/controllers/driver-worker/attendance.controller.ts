// Driver/Worker attendance controller

import { NextFunction, Request, Response } from "express";
import {
  checkInSchema,
  checkOutSchema,
  getMyLogsQuerySchema,
} from "../../validations/attendance.validation.js";
import { attendanceService } from "../../services/driver-worker/index.js";

export const checkIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    checkInSchema.parse(req.body);
    const attendance = await attendanceService.checkIn(userId!);
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
    const userId = req.user?.userId;
    const { attendanceId } = checkOutSchema.parse(req.body);
    const attendance = await attendanceService.checkOut(attendanceId, userId!);
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
    const userId = req.user?.userId;
    const { page, limit, startDate, endDate } = getMyLogsQuerySchema.parse(
      req.query,
    );
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const result = await attendanceService.getMyattendanceLogs(
      userId!,
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
    const userId = req.user?.userId;
    const result = await attendanceService.checkTodayAttendance(userId!);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
