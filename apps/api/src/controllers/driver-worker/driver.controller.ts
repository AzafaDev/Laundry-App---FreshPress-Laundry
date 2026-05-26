import { Request, Response, NextFunction } from "express";
import { driverService } from "../../services/driver-worker/index.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const getAvailablePickups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);
    const tasks = await driverService.getAvailablePickupOrders(employeeId);
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
};

export const getAvailableDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);
    const tasks = await driverService.getAvailableDeliveryOrders(employeeId);
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
};