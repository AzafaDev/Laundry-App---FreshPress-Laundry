import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const listAdminNotifications = async (employeeId: string) => {
  return prisma.notification.findMany({
    where: { user_type: "employee", user_id: employeeId },
    orderBy: { created_at: "desc" },
    take: 50,
  });
};

export const getUnreadCount = async (employeeId: string) => {
  return prisma.notification.count({
    where: { user_type: "employee", user_id: employeeId, is_read: false },
  });
};

export const markNotificationAsRead = async (employeeId: string, notificationId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, user_type: "employee", user_id: employeeId },
  });

  if (!notification) {
    throw new AppError("Notifikasi tidak ditemukan.", 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
  });
};

export const markAllNotificationsAsRead = async (employeeId: string) => {
  await prisma.notification.updateMany({
    where: { user_type: "employee", user_id: employeeId, is_read: false },
    data: { is_read: true },
  });
};
