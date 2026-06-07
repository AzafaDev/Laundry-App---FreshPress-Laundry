import { axiosInstance } from "@/lib/axios";
import type {
  OrderListQuery,
  OrderListResponse,
  OrderDetail,
} from "@/types/order.types";

export const orderService = {
  /** List orders with pagination + filters */
  async list(query: OrderListQuery = {}): Promise<OrderListResponse> {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.status) params.set("status", query.status);
    if (query.outlet_id) params.set("outlet_id", query.outlet_id);
    if (query.date_from) params.set("date_from", query.date_from);
    if (query.date_to) params.set("date_to", query.date_to);
    if (query.sort_by) params.set("sort_by", query.sort_by);
    if (query.sort_dir) params.set("sort_dir", query.sort_dir);
    const { data } = await axiosInstance.get(
      `/v1/admin/orders?${params.toString()}`,
    );
    return data;
  },

  /** Get single order detail */
  async getById(id: string): Promise<OrderDetail> {
    const { data } = await axiosInstance.get(`/v1/admin/orders/${id}`);
    return data.data;
  },

  /** Process order (outlet admin: input weight + items) */
  async processOrder(
    id: string,
    payload: {
      total_weight_kg: number;
      items: { laundry_item_id: string; quantity: number }[];
      notes?: string;
    },
  ): Promise<OrderDetail> {
    const { data } = await axiosInstance.post(
      `/v1/admin/orders/${id}/process`,
      payload,
    );
    return data.data;
  },
};
