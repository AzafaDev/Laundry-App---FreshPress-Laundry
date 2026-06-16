import { axiosInstance } from "@/lib/axios";
import type {
  OrderListQuery,
  OrderListResponse,
  OrderDetail,
} from "@/types/order.types";

export type CustomerOrderStatus =
  | "waiting_pickup_driver"
  | "laundry_to_outlet"
  | "laundry_arrived_outlet"
  | "washing"
  | "ironing"
  | "packing"
  | "waiting_payment"
  | "ready_for_delivery"
  | "delivery_to_customer"
  | "received_by_customer"
  | "completed";

export interface CustomerOrderHistory {
  id: string;
  old_status: CustomerOrderStatus | null;
  new_status: CustomerOrderStatus;
  created_at: string;
  note?: string | null;
}

export interface CustomerOrderItem {
  id: string;
  quantity: string | number;
  price_at_order: string | number;
  laundry_item: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface CustomerOrder {
  id: string;
  invoice_number: string;
  status: CustomerOrderStatus;
  pickup_schedule: string | null;
  total_weight_kg: string | number | null;
  total_price: string | number | null;
  delivery_fee: string | number | null;
  created_at: string;
  updated_at: string;
  outlet?: {
    id: string;
    name: string;
    city?: string;
  };
  payment?: {
    status: string;
    amount?: string | number;
    paid_at?: string;
  } | null;
  status_histories?: CustomerOrderHistory[];
  order_items?: CustomerOrderItem[];
  complaints?: { id: string }[];
}

export type ComplaintType =
  | "missing_item"
  | "damaged_item"
  | "wrong_item"
  | "late_delivery"
  | "quality_issue"
  | "other";

export interface CreateComplaintPayload {
  complaint_type: ComplaintType;
  description: string;
}

export interface CreateCustomerOrderPayload {
  pickup_address_id: string;
  pickup_date: string;
  service_type: "wash-and-fold" | "dry-cleaning";
  estimated_weight_kg?: number;
  notes?: string;
}

type Envelope<T> = { success: true; message: string; data: T };

export const orderService = {
  // ── Admin methods ──────────────────────────────────────────────────────────
  list: async (query: OrderListQuery = {}): Promise<OrderListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.status) params.set("status", query.status);
    if (query.outlet_id) params.set("outlet_id", query.outlet_id);
    if (query.date_from) params.set("date_from", query.date_from);
    if (query.date_to) params.set("date_to", query.date_to);
    if (query.sort_by) params.set("sort_by", query.sort_by);
    if (query.sort_dir) params.set("sort_dir", query.sort_dir);
    const { data } = await axiosInstance.get(`/v1/admin/orders?${params.toString()}`);
    return data;
  },

  getById: async (id: string): Promise<OrderDetail> => {
    const { data } = await axiosInstance.get(`/v1/admin/orders/${id}`);
    return data.data;
  },

  processOrder: async (
    id: string,
    payload: {
      total_weight_kg: number;
      items: { laundry_item_id: string; quantity: number }[];
      breakdown?: { clothing_type_id: string; quantity: number }[];
      notes?: string;
    },
  ): Promise<OrderDetail> => {
    const { data } = await axiosInstance.post(`/v1/admin/orders/${id}/process`, payload);
    return data.data;
  },

  // ── Customer methods ───────────────────────────────────────────────────────
  createOrder: async (payload: CreateCustomerOrderPayload): Promise<CustomerOrder> => {
    const { data } = await axiosInstance.post<Envelope<CustomerOrder>>(
      "/v1/customer/orders",
      payload,
    );
    return data.data;
  },

  listOrders: async (): Promise<CustomerOrder[]> => {
    const { data } = await axiosInstance.get<Envelope<CustomerOrder[]>>(
      "/v1/customer/orders",
    );
    return data.data;
  },

  getOrderById: async (orderId: string): Promise<CustomerOrder> => {
    const { data } = await axiosInstance.get<Envelope<CustomerOrder>>(
      `/v1/customer/orders/${orderId}`,
    );
    return data.data;
  },

  completeOrder: async (orderId: string): Promise<CustomerOrder> => {
    const { data } = await axiosInstance.patch<Envelope<CustomerOrder>>(
      `/v1/customer/orders/${orderId}/complete`,
    );
    return data.data;
  },

  createComplaint: async (
    orderId: string,
    payload: CreateComplaintPayload,
  ): Promise<{ id: string }> => {
    const { data } = await axiosInstance.post<Envelope<{ id: string }>>(
      `/v1/customer/orders/${orderId}/complaints`,
      payload,
    );
    return data.data;
  },
};