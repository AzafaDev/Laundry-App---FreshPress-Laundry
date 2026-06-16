import { Request, Response, NextFunction } from "express";
import { driverService } from "../../services/driver-worker/driver.service.js";
import { mapDriverTaskToActivePayload, mapTaskHistoryItem } from "../../helpers/driver-worker/driver.helpers.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { requireUserId } from "../../utils/asyncHandler.js";

export const getAvailablePickups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await driverService.getAvailablePickupOrders(requireUserId(req));
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
};

export const getAvailableDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await driverService.getAvailableDeliveryOrders(requireUserId(req));
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
};

export const getActiveTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await driverService.getActiveTask(requireUserId(req));
    res.json({ success: true, data: mapDriverTaskToActivePayload(task) });
  } catch (err) { next(err); }
};

export const claimTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.taskId as string;
    if (!taskId) throw new AppError("Task ID diperlukan", 400);
    const task = await driverService.claimTask(requireUserId(req), taskId);
    res.json({ success: true, data: mapDriverTaskToActivePayload(task) });
  } catch (err) { next(err); }
};

export const getTaskHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const result = await driverService.getTaskHistory(requireUserId(req), page, limit);
    res.json({ success: true, data: { ...result, tasks: result.tasks.map(mapTaskHistoryItem) } });
  } catch (err) { next(err); }
};

export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.taskId as string;
    if (!taskId) throw new AppError("Task ID diperlukan", 400);
    await driverService.completeTask(requireUserId(req), taskId);
    res.json({ success: true, data: mapDriverTaskToActivePayload(null) });
  } catch (err) { next(err); }
};