import { Request, Response, NextFunction } from "express";
import { workerService } from "../../services/driver-worker/index.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const getStationOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    const station = req.params.station as "washing" | "ironing" | "packing";
    if (!employeeId || !station) throw new AppError("Invalid request", 400);
    const orders = await workerService.getStationOrders(employeeId, station);
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};