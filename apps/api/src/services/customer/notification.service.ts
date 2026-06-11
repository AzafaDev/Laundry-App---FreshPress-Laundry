import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const listCustomerNotifications = async (customerId: string) => {
  return prisma.notification.findMany({
    where: { user_type: "customer", user_id: customerId },
    orderBy: { created_at: "desc" },
    take: 50,
  });
};

export const getUnreadCount = async (customerId: string) => {
  return prisma.notification.count({
    where: { user_type: "customer", user_id: customerId, is_read: false },
  });
};

export const markNotificationAsRead = async (customerId: string, notificationId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, user_type: "customer", user_id: customerId },
  });

  if (!notification) {
    throw new AppError("Notifikasi tidak ditemukan.", 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { is_read: true },
  });
};

export const markAllNotificationsAsRead = async (customerId: string) => {
  await prisma.notification.updateMany({
    where: { user_type: "customer", user_id: customerId, is_read: false },
    data: { is_read: true },
  });
};
