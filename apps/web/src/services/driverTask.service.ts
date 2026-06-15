import { axiosInstance } from "@/lib/axios";

export type DriverTaskType = "pickup" | "delivery";
export type DriverTaskStatus = "available" | "in_progress" | "completed" | "cancelled";

export interface DriverTask {
  id: string;
  order_id: string;
  driver_id: string | null;
  task_type: DriverTaskType;
  status: DriverTaskStatus;
  taken_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    invoice_number: string;
    outlet_id: string;
    pickup_address: {
      address: string;
      latitude: number;
      longitude: number;
    };
    delivery_address?: {
      address: string;
      latitude: number;
      longitude: number;
    };
    customer: {
      full_name: string;
      phone: string;
    };
    notes?: string | null;
  };
}

export interface ActiveTaskResponse {
  hasActiveTask: boolean;
  task: DriverTask | null;
}

export interface AvailableTasksResponse {
  tasks: DriverTask[];
  next_release_at: string | null;
}

export const driverTaskService = {
  getAvailablePickups: async (): Promise<AvailableTasksResponse> => {
    const { data } = await axiosInstance.get<{ success: true; data: AvailableTasksResponse }>(
      "/v1/driver/pickups/available"
    );
    return data.data;
  },

  getAvailableDeliveries: async (): Promise<AvailableTasksResponse> => {
    const { data } = await axiosInstance.get<{ success: true; data: AvailableTasksResponse }>(
      "/v1/driver/deliveries/available"
    );
    return data.data;
  },

  getActiveTask: async (): Promise<ActiveTaskResponse> => {
    const { data } = await axiosInstance.get<{ success: true; data: ActiveTaskResponse }>(
      "/v1/driver/tasks/active"
    );
    return data.data;
  },

  claimTask: async (taskId: string): Promise<ActiveTaskResponse> => {
    const { data } = await axiosInstance.post<{ success: true; data: ActiveTaskResponse }>(
      `/v1/driver/tasks/${taskId}/claim`
    );
    return data.data;
  },

  completeTask: async (taskId: string): Promise<ActiveTaskResponse> => {
    const { data } = await axiosInstance.patch<{ success: true; data: ActiveTaskResponse }>(
      `/v1/driver/tasks/${taskId}/complete`
    );
    return data.data;
  },
};