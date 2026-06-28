"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft, Package, Truck, User, CreditCard, PlayCircle } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { ORDER_STATUS_LABELS, ORDER_STATUS_LIST, type OrderStatus } from "@/types/order.types";
import type { ProcessLog, DriverTask, OrderItem, OrderItemBreakdown, OrderStatusHistory } from "@/types/order.types";
import { ProcessOrderModal } from "@/components/orders/ProcessOrderModal";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (v: string | number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(v));

const fmtDateTime = (s: string | null) =>
  s
    ? new Date(s).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATION_LABEL: Record<string, string> = {
  washing: "Washing Station",
  ironing: "Ironing Station",
  packing: "Packing Station",
};

const STEP_ORDER = ORDER_STATUS_LIST;

// ── Status Stepper ─────────────────────────────────────────────────────────────
function StatusStepper({ current }: { current: OrderStatus }) {
  const currentIdx = STEP_ORDER.indexOf(current as (typeof STEP_ORDER)[number]);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-0">
        {STEP_ORDER.map((status, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={status} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${isCurrent ? "bg-primary text-on-primary ring-2 ring-primary ring-offset-2" : ""}
                    ${isDone ? "bg-secondary-container text-on-secondary-container" : ""}
                    ${!isCurrent && !isDone ? "bg-surface-container-highest text-on-surface-variant" : ""}
                  `}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[10px] text-center max-w-[72px] leading-tight ${
                    isCurrent ? "text-primary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  {ORDER_STATUS_LABELS[status]}
                </span>
              </div>
              {idx < STEP_ORDER.length - 1 && (
                <div
                  className={`w-10 h-0.5 shrink-0 -mt-5 ${
                    idx < currentIdx ? "bg-secondary-container" : "bg-outline-variant"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Process Log Timeline ───────────────────────────────────────────────────────
// station name → the order status that marks the START of that station
const STATION_START_STATUS: Record<string, string> = {
  washing: "washing",
  ironing: "ironing",
  packing: "packing",
};

function ProcessTimeline({
  logs,
  statusHistories,
}: {
  logs: ProcessLog[];
  statusHistories: OrderStatusHistory[];
}) {
  if (logs.length === 0) {
    return <p className="text-sm text-on-surface-variant">Belum ada proses di station.</p>;
  }

  // Build a map: status → earliest created_at from status_histories
  const statusStartMap: Record<string, string> = {};
  for (const h of statusHistories) {
    if (!statusStartMap[h.new_status]) {
      statusStartMap[h.new_status] = h.created_at;
    }
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const startStatus = STATION_START_STATUS[log.station];
        const startedAt = log.started_at ?? (startStatus ? (statusStartMap[startStatus] ?? null) : null);
        return (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  log.completed_at
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-primary-container text-on-primary-container"
                }`}
              >
                {log.completed_at ? "✓" : "…"}
              </div>
              <div className="w-0.5 flex-1 bg-outline-variant mt-1" />
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="font-medium text-sm">
                  {STATION_LABEL[log.station] ?? log.station}
                </span>
                {log.is_bypassed && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-tertiary-container text-on-tertiary-container font-medium">
                    Bypass
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">
                Worker: <span className="font-medium">{log.employee.full_name}</span>
              </p>
              <p className="text-xs text-on-surface-variant">
                Mulai: <span className="font-medium text-on-surface">{fmtDateTime(startedAt)}</span>
              </p>
              <p className="text-xs text-on-surface-variant">
                Selesai: <span className="font-medium text-on-surface">{fmtDateTime(log.completed_at)}</span>
              </p>
              {log.notes && (
                <p className="text-xs text-on-surface-variant mt-1 italic">{log.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useEmployeeAuthStore((s) => s.user);
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const [showProcessModal, setShowProcessModal] = useState(false);

  const canProcess =
    user?.role === "outlet_admin" && order?.status === "laundry_arrived_outlet";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant text-sm">
        Memuat data order...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-error">Order tidak ditemukan.</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-primary underline"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
        <span>Admin</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => router.back()} className="hover:text-primary transition-colors">
          Orders
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-primary font-bold">{order.invoice_number}</span>
      </div>

      {/* Title row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-surface-container-high rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{order.invoice_number}</h2>
            <p className="text-sm text-on-surface-variant">
              {order.outlet.name} · {fmtDateTime(order.created_at)}
            </p>
          </div>
        </div>

        {canProcess && (
          <button
            onClick={() => setShowProcessModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90"
          >
            <PlayCircle className="w-4 h-4" />
            Proses Order
          </button>
        )}
      </div>

      {/* Alert: awaiting processing */}
      {canProcess && (
        <div className="bg-primary-container text-on-primary-container rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <PlayCircle className="w-4 h-4 shrink-0" />
          Laundry telah tiba di outlet. Input berat dan item untuk memulai proses pencucian.
        </div>
      )}

      {/* Status Stepper */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wide text-on-surface-variant">
          Status Order
        </h3>
        <StatusStepper current={order.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer */}
        <div className="bg-surface border border-outline-variant rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Customer</span>
          </div>
          <p className="font-medium">{order.customer.full_name}</p>
          <p className="text-sm text-on-surface-variant">{order.customer.email}</p>
          {order.customer.phone && (
            <p className="text-sm text-on-surface-variant">{order.customer.phone}</p>
          )}
          {order.pickup_address && (
            <div className="mt-2 pt-2 border-t border-outline-variant">
              <p className="text-xs font-semibold text-on-surface-variant mb-0.5">
                Alamat Penjemputan
                {order.pickup_address.label ? ` · ${order.pickup_address.label}` : ""}
              </p>
              <p className="text-sm">{order.pickup_address.address}</p>
              <p className="text-xs text-on-surface-variant">
                {order.pickup_address.district}, {order.pickup_address.city},{" "}
                {order.pickup_address.province}
                {order.pickup_address.postal_code ? ` ${order.pickup_address.postal_code}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Driver */}
        <div className="bg-surface border border-outline-variant rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <Truck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Driver Tasks</span>
          </div>
          {order.pickup_schedule && (
            <div className="flex justify-between text-sm border-b border-outline-variant pb-2 mb-1">
              <span className="text-on-surface-variant">Pickup Date</span>
              <span className="font-medium">{fmtDateTime(order.pickup_schedule)}</span>
            </div>
          )}
          {order.driver_tasks.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Belum ada driver task.</p>
          ) : (
            order.driver_tasks.map((task: DriverTask) => {
              // Compute distance the same way as the driver service (haversine)
              const addrLat = order.pickup_address ? Number(order.pickup_address.latitude) : null;
              const addrLng = order.pickup_address ? Number(order.pickup_address.longitude) : null;
              const outLat = order.outlet.latitude != null ? Number(order.outlet.latitude) : null;
              const outLng = order.outlet.longitude != null ? Number(order.outlet.longitude) : null;
              let distanceKm: number | null = null;
              if (addrLat != null && addrLng != null && outLat != null && outLng != null) {
                const toRad = (d: number) => (d * Math.PI) / 180;
                const dLat = toRad(addrLat - outLat);
                const dLng = toRad(addrLng - outLng);
                const a =
                  Math.sin(dLat / 2) ** 2 +
                  Math.cos(toRad(outLat)) * Math.cos(toRad(addrLat)) * Math.sin(dLng / 2) ** 2;
                distanceKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
              }
              return (
                <div key={task.id} className="text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium capitalize">
                      {task.task_type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === "completed"
                          ? "bg-secondary-container text-on-secondary-container"
                          : task.status === "in_progress"
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      {task.status}
                    </span>
                    {distanceKm != null && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                        {distanceKm} km
                      </span>
                    )}
                  </div>
                  {task.driver && (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {task.driver.full_name}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Payment */}
        <div className="bg-surface border border-outline-variant rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Pembayaran</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Berat</span>
              <span>{order.total_weight_kg ? `${order.total_weight_kg} kg` : "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Ongkir</span>
              {Number(order.delivery_fee ?? 0) > 0 ? (
                <span>{fmtPrice(order.delivery_fee)}</span>
              ) : (
                <span className="text-secondary font-medium">Gratis</span>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Total</span>
              <span className="font-bold">{fmtPrice(order.total_price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Status Bayar</span>
              <span
                className={`font-medium ${
                  order.payment?.status === "paid" ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                {order.payment?.status ?? "Belum bayar"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-on-surface-variant mb-1">
          <Package className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Item Laundry</span>
        </div>
        {order.order_items.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            Belum ada item — outlet admin belum memproses order ini.
          </p>
        ) : (
          <div className="divide-y divide-outline-variant">
            {order.order_items.map((item: OrderItem) => {
              const isKiloan = item.laundry_item.unit === "kg";
              const breakdowns = isKiloan ? (order.order_item_breakdowns ?? []) : [];
              return (
                <div key={item.id} className="py-2 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.laundry_item.name}</span>
                      <span className="text-on-surface-variant ml-2">
                        × {item.quantity} {item.laundry_item.unit}
                      </span>
                    </div>
                    <span className="font-medium">{fmtPrice(Number(item.price_at_order) * Number(item.quantity))}</span>
                  </div>
                  {/* Breakdown per clothing type for kiloan items */}
                  {isKiloan && breakdowns.length > 0 && (
                    <div className="mt-2 ml-3 space-y-1 border-l-2 border-outline-variant pl-3">
                      <p className="text-xs font-semibold text-on-surface-variant mb-1">Rincian jenis pakaian:</p>
                      {breakdowns.map((b: OrderItemBreakdown) => (
                        <div key={b.id} className="flex justify-between text-xs text-on-surface-variant">
                          <span>{b.clothing_type.name}</span>
                          <span className="font-medium">{b.quantity} pcs</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Process log */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          Timeline Proses Station
        </h3>
        <ProcessTimeline logs={order.process_logs} statusHistories={order.status_histories} />
      </div>

      {/* Status history */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
          Riwayat Status
        </h3>
        {order.status_histories.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Belum ada riwayat status.</p>
        ) : (
          <div className="space-y-2">
            {[...order.status_histories].reverse().map((h: OrderStatusHistory) => (
              <div key={h.id} className="flex justify-between items-start text-sm gap-2">
                <div>
                  <span className="font-medium">
                    {ORDER_STATUS_LABELS[h.new_status] ?? h.new_status}
                  </span>
                  {h.note && <p className="text-xs text-on-surface-variant">{h.note}</p>}
                </div>
                <span className="text-xs text-on-surface-variant whitespace-nowrap shrink-0">
                  {fmtDateTime(h.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process modal */}
      {showProcessModal && (
        <ProcessOrderModal
          orderId={order.id}
          invoiceNumber={order.invoice_number}
          deliveryFee={order.delivery_fee}
          onClose={() => setShowProcessModal(false)}
          onSuccess={() => refetch()}
        />
      )}
    </>
  );
}
