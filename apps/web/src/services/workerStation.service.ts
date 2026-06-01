import { axiosInstance } from "@/lib/axios";

export type StationType = "washing" | "ironing" | "packing";

export interface StationOrder {
  id: string;
  invoice_number: string;
  customer_id: string;
  outlet_id: string;
  status: string;
  total_weight_kg: number | null;
  total_price: number | null;
  notes: string | null;
  created_at: string;
  customer: {
    id: string;
    full_name: string;
    phone: string;
  };
  order_items: Array<{
    id: string;
    laundry_item_id: string;
    quantity: number;
    price_at_order: number;
    laundry_item: {
      name: string;
      unit: string;
    };
  }>;
}

export const workerStationService = {
  getStationOrders: async (station: StationType): Promise<StationOrder[]> => {
    const { data } = await axiosInstance.get<{ success: true; data: StationOrder[] }>(
      `/v1/worker/station/${station}`
    );
    return data.data;
  },

  completeStation: async (station: StationType, orderId: string): Promise<{ order: StationOrder; createdDeliveryTask: boolean }> => {
    const { data } = await axiosInstance.patch<{
      success: true;
      data: { order: StationOrder; createdDeliveryTask: boolean };
    }>(`/v1/worker/station/${station}/orders/${orderId}/complete`);
    return data.data;
  },
};