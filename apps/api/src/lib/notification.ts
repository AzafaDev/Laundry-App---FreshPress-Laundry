import { prisma } from "./prisma.js";
import { emitToUser, emitToRoom } from "./socket.js";

export type NotificationType =
  | "driver_pickup_started"
  | "driver_arrived_outlet"
  | "order_details"
  | "payment"
  | "payment_received"
  | "driver_delivery_started"
  | "driver_arrived_customer"
  | "order_completed"
  | "order_update";

interface CreateNotificationInput {
  userType: "customer" | "employee";
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  relatedEntityId?: string;
}

export async function createNotification({
  userType,
  userId,
  title,
  body,
  type,
  relatedEntityId,
}: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      user_type: userType,
      user_id: userId,
      title,
      body,
      type,
      related_entity_id: relatedEntityId,
    },
  });

  emitToUser(userId, "notification:new", notification);

  return notification;
}

/**
 * Notify all outlet_admin employees at a given outlet.
 * Creates a DB notification record per admin and emits to their user room.
 * Also emits a lightweight socket event to the outlet room for real-time badge updates.
 */
export async function notifyOutletAdmins(
  outletId: string,
  title: string,
  body: string,
  type: NotificationType,
  relatedEntityId?: string,
) {
  const admins = await prisma.employee.findMany({
    where: {
      outlet_id: outletId,
      role: "outlet_admin",
      is_active: true,
      deleted_at: null,
    },
    select: { id: true },
  });

  if (admins.length === 0) return;

  const notifications = await Promise.all(
    admins.map((admin) =>
      prisma.notification.create({
        data: {
          user_type: "employee",
          user_id: admin.id,
          title,
          body,
          type,
          related_entity_id: relatedEntityId,
        },
      }),
    ),
  );

  // Emit per-user so each admin's unread count updates live
  for (const notif of notifications) {
    emitToUser(notif.user_id, "notification:new", notif);
  }

  // Also broadcast a lightweight event to the outlet room (for any listeners)
  emitToRoom(`outlet:${outletId}`, "outlet:payment-received", {
    outletId,
    title,
    body,
    relatedEntityId,
  });

  return notifications;
}

export async function notifyCustomer(
  customerId: string,
  title: string,
  body: string,
  type: NotificationType,
  relatedEntityId?: string,
) {
  return createNotification({
    userType: "customer",
    userId: customerId,
    title,
    body,
    type,
    relatedEntityId,
  });
}
