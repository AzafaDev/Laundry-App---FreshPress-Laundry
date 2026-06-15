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
  bypassStatus: "pending" | "rejected" | "approved" | null;
  bypassAdminNotes: string | null;
  customer: {
    id: string;
    full_name: string;
    phone: string;
  };
  order_item_breakdowns: Array<{
    id: string;
    clothing_type_id: string;
    quantity: number;
    clothing_type: {
      name: string;
    };
  }>;
  order_items: Array<{
    id: string;
    laundry_item_id: string;
    quantity: number;
    laundry_item: {
      name: string;
      unit: string;
    };
  }>;
}

export interface BypassDetail {
  id: string;
  status: "pending" | "approved" | "rejected";
  station: string;
  expected_items: Array<{ item_type: "breakdown" | "satuan"; item_id: string; name: string; quantity: number }>;
  actual_items: Array<{ item_type: "breakdown" | "satuan"; item_id: string; name: string; quantity: number }>;
  discrepancy_description: string;
  photo_evidence: string[];
  attempt_number: number;
  created_at: string;
}

export interface Discrepancy {
  item_type: "breakdown" | "satuan";
  item_id: string;
  name: string;
  expected: number;
  actual: number;
}

export const workerStationService = {
  getStationOrders: async (station: StationType): Promise<StationOrder[]> => {
    const { data } = await axiosInstance.get<{ success: true; data: StationOrder[] }>(
      `/v1/worker/station/${station}`
    );
    return data.data;
  },

  submitItems: async (
    station: StationType,
    orderId: string,
    actual_items: { clothing_type_id: string; actual_quantity: number }[],
    actual_satuan_items: { laundry_item_id: string; actual_quantity: number }[] = [],
  ): Promise<{ success: true; data: StationOrder } | { success: false; requiresBypass: true; discrepancies: Discrepancy[] }> => {
    const { data } = await axiosInstance.post(
      `/v1/worker/station/${station}/orders/${orderId}/submit-items`,
      { actual_items, actual_satuan_items }
    );
    return data;
  },

  createBypassRequest: async (formData: FormData): Promise<void> => {
    await axiosInstance.post(`/v1/worker/bypass`, formData);
  },

  completeStation: async (station: StationType, orderId: string): Promise<{ order: StationOrder; createdDeliveryTask: boolean }> => {
    const { data } = await axiosInstance.patch<{
      success: true;
      data: { order: StationOrder; createdDeliveryTask: boolean };
    }>(`/v1/worker/station/${station}/orders/${orderId}/complete`);
    return data.data;
  },

  getBypassDetail: async (orderId: string): Promise<BypassDetail | null> => {
    const { data } = await axiosInstance.get<{ success: true; data: BypassDetail | null }>(
      `/v1/worker/orders/${orderId}/bypass`
    );
    return data.data;
  },
};
