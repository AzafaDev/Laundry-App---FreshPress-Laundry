import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import * as NotificationService from "../../services/admin/notification.service.js";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.userId;
  const notifications = await NotificationService.listAdminNotifications(employeeId);
  ok(res, notifications, "Daftar notifikasi berhasil diambil.");
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.userId;
  const count = await NotificationService.getUnreadCount(employeeId);
  ok(res, { count }, "Jumlah notifikasi belum dibaca berhasil diambil.");
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.userId;
  const notificationId = req.params.id as string;
  const notification = await NotificationService.markNotificationAsRead(employeeId, notificationId);
  ok(res, notification, "Notifikasi ditandai sudah dibaca.");
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.userId;
  await NotificationService.markAllNotificationsAsRead(employeeId);
  ok(res, null, "Semua notifikasi ditandai sudah dibaca.");
});
