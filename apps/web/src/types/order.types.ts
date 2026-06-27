export type OrderStatus =
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

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  waiting_pickup_driver: "Menunggu Penjemputan Driver",
  laundry_to_outlet: "Laundry Menuju Outlet",
  laundry_arrived_outlet: "Laundry Tiba di Outlet",
  washing: "Sedang Dicuci",
  ironing: "Sedang Disetrika",
  packing: "Sedang Di-Packing",
  waiting_payment: "Menunggu Pembayaran",
  ready_for_delivery: "Siap Diantar",
  delivery_to_customer: "Sedang Dikirim",
  received_by_customer: "Diterima Customer",
  completed: "Selesai",
};

export const ORDER_STATUS_LIST = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export interface OrderSummary {
  id: string;
  invoice_number: string;
  status: OrderStatus;
  pickup_date: string | null;
  pickup_schedule: string | null;
  total_weight_kg: string | number | null;
  total_price: string | number | null;
  delivery_fee: string | number | null;
  created_at: string;
  updated_at: string;
  customer: { id: string; full_name: string; email: string; phone: string | null };
  outlet: { id: string; name: string; latitude?: string | number | null; longitude?: string | number | null };
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by_type: string;
  changed_by_id: string | null;
  note: string | null;
  created_at: string;
}

export interface ProcessLog {
  id: string;
  order_id: string;
  station: string;
  input_items: unknown;
  is_bypassed: boolean;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  employee: { id: string; full_name: string; role: string };
}

export interface DriverTask {
  id: string;
  order_id: string;
  task_type: string;
  status: string;
  taken_at: string | null;
  completed_at: string | null;
  created_at: string;
  driver: { id: string; full_name: string } | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price_at_order: string | number;
  laundry_item: { id: string; name: string; unit: string };
}

export interface OrderItemBreakdown {
  id: string;
  clothing_type_id: string;
  quantity: number;
  clothing_type: { id: string; name: string };
}

export interface OrderDetail extends OrderSummary {
  notes: string | null;
  pickup_address: {
    id: string;
    label: string;
    address: string;
    city: string;
    district: string;
    province: string;
    postal_code: string | null;
    latitude: string | number;
    longitude: string | number;
  } | null;
  order_items: OrderItem[];
  order_item_breakdowns: OrderItemBreakdown[];
  status_histories: OrderStatusHistory[];
  process_logs: ProcessLog[];
  driver_tasks: DriverTask[];
  payment: { id: string; status: string; amount: string | number } | null;
}

export interface Complaint {
  id: string;
  order_id: string;
  customer_id: string;
  complaint_type: string;
  description: string;
  photo_urls: string[];
  status: "open" | "in_progress" | "resolved" | "rejected";
  expected_resolution_date: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  order: { id: string; invoice_number: string; outlet_id: string | null; outlet: { name: string } | null };
  customer: { id: string; full_name: string; email: string; phone: string | null };
  resolver: { id: string; full_name: string } | null;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus | "";
  outlet_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: "created_at" | "updated_at";
  sort_dir?: "asc" | "desc";
}

export interface OrderListResponse {
  data: OrderSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
