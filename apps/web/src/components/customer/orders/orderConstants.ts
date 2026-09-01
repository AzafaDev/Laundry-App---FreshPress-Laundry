import type { CustomerOrderStatus } from "@/services/order.service";
import type { Locale } from "@/stores/localeStore";

export const ORDER_PROGRESS_STATUS_KEYS: CustomerOrderStatus[] = [
  "waiting_pickup_driver",
  "laundry_to_outlet",
  "laundry_arrived_outlet",
  "washing",
  "ironing",
  "packing",
  "waiting_payment",
  "ready_for_delivery",
  "delivery_to_customer",
  "received_by_customer",
  "completed",
];

export function getProgressIndex(status: CustomerOrderStatus) {
  return ORDER_PROGRESS_STATUS_KEYS.indexOf(status);
}

export const formatDateTime = (value: string | Date, locale: Locale = "id") =>
  new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function formatWhatsApp(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  return cleaned;
}
