import { axiosInstance } from "@/lib/axios";

export type EmployeeNotificationType =
  | "driver_pickup_started"
  | "driver_arrived_outlet"
  | "order_details"
  | "payment"
  | "driver_delivery_started"
  | "driver_arrived_customer"
  | "order_completed"
  | "new_pickup_request"
  | "payment_completed"
  | "complaint_submitted";

export interface EmployeeNotification {
  id: string;
  user_type: string;
  user_id: string;
  title: string;
  body: string;
  type: EmployeeNotificationType | null;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

type Envelope<T> = { success: true; message: string; data: T };

export const employeeNotificationService = {
  list: async (): Promise<EmployeeNotification[]> => {
    const { data } = await axiosInstance.get<Envelope<EmployeeNotification[]>>(
      "/v1/employee/notifications",
      { withCredentials: true },
    );
    return data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get<Envelope<{ count: number }>>(
      "/v1/employee/notifications/unread-count",
      { withCredentials: true },
    );
    return data.data.count;
  },

  markAsRead: async (notificationId: string): Promise<EmployeeNotification> => {
    const { data } = await axiosInstance.patch<Envelope<EmployeeNotification>>(
      `/v1/employee/notifications/${notificationId}/read`,
      {},
      { withCredentials: true },
    );
    return data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch("/v1/employee/notifications/read-all", {}, { withCredentials: true });
  },
};
