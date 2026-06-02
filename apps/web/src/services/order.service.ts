import { axiosInstance } from "@/lib/axios";
import type {
  OrderListQuery,
  OrderListResponse,
  OrderDetail,
} from "@/types/order.types";

type Envelope<T> = { success: true; data: T };

export const orderService = {
  list: async (params: OrderListQuery = {}): Promise<OrderListResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== "" && v !== undefined),
    );
    const { data } = await axiosInstance.get<OrderListResponse>(
      "/v1/admin/orders",
      { params: cleanParams },
    );
    return data;
  },

  processOrder: async (
    id: string,
    payload: { total_weight_kg: number; items: { laundry_item_id: string; quantity: number }[]; notes?: string },
  ): Promise<OrderDetail> => {
    const { data } = await axiosInstance.post<Envelope<OrderDetail>>(
      `/v1/admin/orders/${id}/process`,
      payload,
    );
    return data.data;
  },

  getById: async (id: string): Promise<OrderDetail> => {
    const { data } = await axiosInstance.get<Envelope<OrderDetail>>(
      `/v1/admin/orders/${id}`,
    );
    return data.data;
  },
};
