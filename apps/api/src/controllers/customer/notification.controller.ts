import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/apiResponse.js";
import * as NotificationService from "../../services/customer/notification.service.js";

function getParamId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const notifications = await NotificationService.listCustomerNotifications(customerId);
  ok(res, notifications, "Daftar notifikasi berhasil diambil.");
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const count = await NotificationService.getUnreadCount(customerId);
  ok(res, { count }, "Jumlah notifikasi belum dibaca berhasil diambil.");
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  const notificationId = getParamId(req.params.id);
  const notification = await NotificationService.markNotificationAsRead(customerId, notificationId);
  ok(res, notification, "Notifikasi ditandai sudah dibaca.");
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.userId;
  await NotificationService.markAllNotificationsAsRead(customerId);
  ok(res, null, "Semua notifikasi ditandai sudah dibaca.");
});
