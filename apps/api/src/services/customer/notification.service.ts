import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const listCustomerNotifications = async (
  customerId: string,
  page = 1,
  limit = 20,
) => {
  const where = { user_type: "customer", user_id: customerId };
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
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
