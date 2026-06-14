import { prisma } from "./prisma.js";
import { emitToUser } from "./socket.js";

export type NotificationType =
  | "driver_pickup_started"
  | "driver_arrived_outlet"
  | "order_details"
  | "payment"
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
