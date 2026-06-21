import type { CustomerOrderStatus } from "@/services/order.service";

export const ORDER_PROGRESS_STEPS: Array<{ key: CustomerOrderStatus; label: string }> = [
  { key: "waiting_pickup_driver", label: "Menunggu driver pickup" },
  { key: "laundry_to_outlet", label: "Driver menjemput laundry" },
  { key: "laundry_arrived_outlet", label: "Laundry tiba di outlet" },
  { key: "washing", label: "Sedang dicuci" },
  { key: "ironing", label: "Sedang disetrika" },
  { key: "packing", label: "Sedang dipacking" },
  { key: "waiting_payment", label: "Menunggu pembayaran" },
  { key: "ready_for_delivery", label: "Siap diantar" },
  { key: "delivery_to_customer", label: "Sedang dikirim" },
  { key: "received_by_customer", label: "Tiba di customer" },
  { key: "completed", label: "Selesai" },
];

export const STATUS_FILTER_OPTIONS: Array<{ value: CustomerOrderStatus | ""; label: string }> = [
  { value: "", label: "Semua status" },
  { value: "waiting_pickup_driver", label: "Menunggu Pickup" },
  { value: "laundry_to_outlet", label: "Menuju Outlet" },
  { value: "laundry_arrived_outlet", label: "Tiba di Outlet" },
  { value: "washing", label: "Sedang Dicuci" },
  { value: "ironing", label: "Sedang Disetrika" },
  { value: "packing", label: "Sedang Dipacking" },
  { value: "waiting_payment", label: "Menunggu Pembayaran" },
  { value: "ready_for_delivery", label: "Siap Diantar" },
  { value: "delivery_to_customer", label: "Dalam Pengantaran" },
  { value: "received_by_customer", label: "Diterima Customer" },
  { value: "completed", label: "Selesai" },
];

export const ORDER_STATUS_LABEL = Object.fromEntries(
  ORDER_PROGRESS_STEPS.map((s) => [s.key, s.label])
) as Record<CustomerOrderStatus, string>;

export const COMPLAINT_STATUS_LABEL: Record<string, string> = {
  in_progress: "Sedang Diproses",
  resolved: "Diselesaikan",
  rejected: "Ditolak",
};

export const COMPLAINT_STATUS_COLOR: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const getProgressIndex = (status: CustomerOrderStatus) =>
  ORDER_PROGRESS_STEPS.findIndex((s) => s.key === status);

export function formatWhatsApp(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  return cleaned;
}
