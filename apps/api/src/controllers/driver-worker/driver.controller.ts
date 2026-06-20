import { Request, Response } from "express";
import { driverService } from "../../services/driver-worker/driver.service.js";
import { mapDriverTaskToActivePayload, mapTaskHistoryItem } from "../../helpers/driver-worker/driver.helpers.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { requireUserId } from "../../utils/asyncHandler.js";

export const getAvailablePickups = async (req: Request, res: Response) => {
  const tasks = await driverService.getAvailablePickupOrders(requireUserId(req));
  res.json({ success: true, data: tasks });
};

export const getAvailableDeliveries = async (req: Request, res: Response) => {
  const tasks = await driverService.getAvailableDeliveryOrders(requireUserId(req));
  res.json({ success: true, data: tasks });
};

export const getActiveTask = async (req: Request, res: Response) => {
  const task = await driverService.getActiveTask(requireUserId(req));
  res.json({ success: true, data: mapDriverTaskToActivePayload(task) });
};

export const claimTask = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if (!taskId) throw new AppError("Task ID diperlukan", 400);
  const task = await driverService.claimTask(requireUserId(req), taskId);
  res.json({ success: true, data: mapDriverTaskToActivePayload(task) });
};

export const getTaskHistory = async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const result = await driverService.getTaskHistory(requireUserId(req), page, limit);
  res.json({ success: true, data: { ...result, tasks: result.tasks.map(mapTaskHistoryItem) } });
};

export const completeTask = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if (!taskId) throw new AppError("Task ID diperlukan", 400);
  await driverService.completeTask(requireUserId(req), taskId);
  res.json({ success: true, data: mapDriverTaskToActivePayload(null) });
};
