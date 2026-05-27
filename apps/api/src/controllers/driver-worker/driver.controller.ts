import { Request, Response, NextFunction } from "express";
import { driverService, mapDriverTaskToActivePayload } from "../../services/driver-worker/index.js";
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

export const getActiveTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);
    const task = await driverService.getActiveTask(employeeId);
    res.json({ success: true, data: mapDriverTaskToActivePayload(task) });
  } catch (err) { next(err); }
};

export const claimTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);
    const taskId = req.params.taskId as string;
    if (!taskId) throw new AppError("Task ID diperlukan", 400);
    const task = await driverService.claimTask(employeeId, taskId);
    res.json({ success: true, data: mapDriverTaskToActivePayload(task) });
  } catch (err) { next(err); }
};

export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = req.user?.userId;
    if (!employeeId) throw new AppError("Unauthorized", 401);
    const taskId = req.params.taskId as string;
    if (!taskId) throw new AppError("Task ID diperlukan", 400);
    const result = await driverService.completeTask(employeeId, taskId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};