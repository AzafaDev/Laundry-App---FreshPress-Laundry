"use client";

import { CalendarClock } from "lucide-react";
import type { CustomerOrder } from "@/services/order.service";
import { formatRupiah } from "@/utils/formatPrice";
import { ComplaintReplySection } from "./ComplaintReplySection";
import { OrderProgressTracker } from "./OrderProgressTracker";
import { formatDateTime } from "./orderConstants";

function isNotToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() !== today.getFullYear() ||
    d.getMonth() !== today.getMonth() ||
    d.getDate() !== today.getDate()
  );
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

interface Props {
  order: CustomerOrder;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  onComplaint: () => void;
}

export function OrderCard({ order, isDropdownOpen, onToggleDropdown, onComplete, isCompleting, onComplaint }: Props) {
  const pickupNotToday = isNotToday(order.pickup_date);

  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-4 md:p-6 shadow-sm space-y-5">
      {pickupNotToday && order.pickup_date && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          <span>Jadwal pengiriman: {formatDate(order.pickup_date)}</span>
        </div>
      )}

      {/* Order meta */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">
            {order.invoice_number}
          </p>
          <p className="text-sm text-on-surface-variant mt-0.5">Outlet: {order.outlet?.name ?? "-"}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">Dibuat: {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <p className="text-sm font-semibold text-on-surface">
            {order.order_items && order.order_items.length > 0
              ? formatRupiah(Number(order.total_price ?? 0))
              : "Harga menyusul"}
          </p>
        </div>
      </div>

      {/* Laundry items */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 space-y-2">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Detail Item Laundry</p>
          <div className="space-y-1">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-on-surface">
                  {item.laundry_item.name}{" "}
                  <span className="text-on-surface-variant">x{Number(item.quantity)} {item.laundry_item.unit}</span>
                </span>
                <span className="font-medium text-on-surface">
                  {formatRupiah(Number(item.price_at_order) * Number(item.quantity))}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Ongkos kirim</span>
              <span className="font-medium text-on-surface">
                {Number(order.delivery_fee ?? 0) > 0
                  ? formatRupiah(Number(order.delivery_fee))
                  : "Gratis"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold border-t border-outline-variant pt-1 mt-1">
              <span className="text-on-surface">Total</span>
              <span className="text-primary">{formatRupiah(Number(order.total_price ?? 0))}</span>
            </div>
          </div>
        </div>
      )}

      <OrderProgressTracker
        order={order}
        isOpen={isDropdownOpen}
        onToggle={onToggleDropdown}
        onComplete={onComplete}
        isCompleting={isCompleting}
        onComplaint={onComplaint}
      />

      {order.complaints && order.complaints.length > 0 && (
        <ComplaintReplySection
          complaint={order.complaints[0]}
          outletPhone={order.outlet?.phone}
        />
      )}
    </article>
  );
}
