import { axiosInstance } from "@/lib/axios";

export type NotificationType =
  | "driver_pickup_started"
  | "driver_arrived_outlet"
  | "order_details"
  | "payment"
  | "driver_delivery_started"
  | "driver_arrived_customer"
  | "order_completed";

export interface CustomerNotification {
  id: string;
  user_type: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

type Envelope<T> = { success: true; message: string; data: T };

export const notificationService = {
  list: async (): Promise<CustomerNotification[]> => {
    const { data } = await axiosInstance.get<Envelope<CustomerNotification[]>>(
      "/v1/customer/notifications",
    );
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get<Envelope<{ count: number }>>(
      "/v1/customer/notifications/unread-count",
    );
    return data.data.count;
  },

  markAsRead: async (notificationId: string): Promise<CustomerNotification> => {
    const { data } = await axiosInstance.patch<Envelope<CustomerNotification>>(
      `/v1/customer/notifications/${notificationId}/read`,
    );
    return data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch("/v1/customer/notifications/read-all");
  },
};

export const driverNotificationService = {
  list: async (): Promise<CustomerNotification[]> => {
    const { data } = await axiosInstance.get<Envelope<CustomerNotification[]>>(
      "/v1/driver/notifications",
    );
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get<Envelope<{ count: number }>>(
      "/v1/driver/notifications/unread-count",
    );
    return data.data.count;
  },

  markAsRead: async (notificationId: string): Promise<CustomerNotification> => {
    const { data } = await axiosInstance.patch<Envelope<CustomerNotification>>(
      `/v1/driver/notifications/${notificationId}/read`,
    );
    return data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch("/v1/driver/notifications/read-all");
  },
};
