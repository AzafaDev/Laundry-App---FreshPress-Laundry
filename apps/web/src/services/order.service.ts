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
  | "completed"
  | "cancelled";

export interface CustomerOrderHistory {
  id: string;
  old_status: CustomerOrderStatus | null;
  new_status: CustomerOrderStatus;
  created_at: string;
  note?: string | null;
}

export interface CustomerOrder {
  id: string;
  invoice_number: string;
  status: CustomerOrderStatus;
  pickup_schedule: string;
  total_weight_kg: string | number | null;
  total_price: string | number | null;
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
}

export interface CreateCustomerOrderPayload {
  pickup_address_id: string;
  pickup_date: string;
  pickup_time_slot: string;
  service_type: "wash-and-fold" | "dry-cleaning";
  estimated_weight_kg?: number;
  notes?: string;
}

type Envelope<T> = { success: true; message: string; data: T };

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
    payload: {
      total_weight_kg: number;
      items: { laundry_item_id: string; quantity: number }[];
      notes?: string;
    },
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

  createOrder: async (
    payload: CreateCustomerOrderPayload,
  ): Promise<CustomerOrder> => {
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
};
