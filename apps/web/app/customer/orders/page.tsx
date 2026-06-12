"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Loader2,
  RefreshCw,
  Truck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Navbar } from "@/components/layout/Navbar";
import { ComplaintModal } from "@/components/customer/ComplaintModal";
import {
  orderService,
  type CustomerOrder,
  type CustomerOrderStatus,
} from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";
import { formatRupiah } from "@/utils/formatPrice";

const ORDER_PROGRESS_STEPS: Array<{ key: CustomerOrderStatus; label: string }> = [
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

const ORDER_STATUS_LABEL: Record<CustomerOrderStatus, string> = {
  waiting_pickup_driver: "Menunggu Pickup Driver",
  laundry_to_outlet: "Menuju Outlet",
  laundry_arrived_outlet: "Tiba di Outlet",
  washing: "Washing",
  ironing: "Ironing",
  packing: "Packing",
  waiting_payment: "Menunggu Pembayaran",
  ready_for_delivery: "Siap Diantar",
  delivery_to_customer: "Dalam Pengantaran",
  received_by_customer: "Diterima Customer",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};


const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getProgressIndex = (status: CustomerOrderStatus) =>
  ORDER_PROGRESS_STEPS.findIndex((step) => step.key === status);

function PickupStatus({ pickupSchedule }: { pickupSchedule: string | null }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!pickupSchedule) return;
    const update = () =>
      setElapsed(formatDistanceToNow(new Date(pickupSchedule), { addSuffix: true, locale: idLocale }));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [pickupSchedule]);

  if (!pickupSchedule) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
        Menunggu driver mengonfirmasi jadwal pickup
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
      <Truck className="w-4 h-4 text-primary" />
      Driver menerima tugas pickup {elapsed}
    </span>
  );
}

export default function CustomerProgressPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, _hasHydrated } = useAuthStore();
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [complaintOrderId, setComplaintOrderId] = useState<string | null>(null);

  const toggleDropdown = (orderId: string) => {
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/customer/login");
    }
  }, [_hasHydrated, user, router]);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<CustomerOrder[]>({
    queryKey: ["customer", "orders"],
    queryFn: orderService.listOrders,
    enabled: _hasHydrated && !!user,
    refetchInterval: 20_000,
  });

  const completeOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.completeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
    },
  });

  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Menyiapkan halaman...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/customer/pickup"
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Buat order baru
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">
                Progress Pesanan
              </span>
              <h1 className="text-3xl font-bold text-on-surface">
                Status laundry kamu.
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Diperbarui otomatis setiap 20 detik. Terakhir cek:{" "}
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <button
              onClick={() => void refetch()}
              disabled={isFetching}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 flex items-center justify-center gap-3 text-sm text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Memuat progress pesanan...
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
            <p className="font-semibold mb-2">Gagal memuat data pesanan.</p>
            <button
              onClick={() => void refetch()}
              className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-outline" />
            </div>
            <p className="font-semibold text-on-surface mb-1">Belum ada pesanan</p>
            <p className="text-sm text-on-surface-variant mb-5">
              Buat order pertama Anda untuk mulai melihat tracking progress.
            </p>
            <Link
              href="/customer/order"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-container transition-colors"
            >
              Buat Order Sekarang
            </Link>
          </div>
        )}

        {/* Order cards */}
        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const progressIndex = getProgressIndex(order.status);
              const activeIndex = progressIndex >= 0 ? progressIndex : 0;

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-outline-variant bg-surface p-4 md:p-6 shadow-sm space-y-5"
                >
                  {/* Order meta */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">
                        {order.invoice_number}
                      </p>
                      <div className="mt-1">
                        <PickupStatus pickupSchedule={order.pickup_schedule} />
                      </div>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Outlet: {order.outlet?.name ?? "-"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                      <p className="text-sm font-semibold text-on-surface">
                        {order.order_items && order.order_items.length > 0
                          ? formatRupiah(Number(order.total_price ?? 0))
                          : "Harga menyusul"}
                      </p>
                    </div>
                  </div>

                  {/* Laundry items input by outlet admin */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 space-y-2">
                      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                        Detail Item Laundry
                      </p>
                      <div className="space-y-1">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-on-surface">
                              {item.laundry_item.name}{" "}
                              <span className="text-on-surface-variant">
                                x{Number(item.quantity)} {item.laundry_item.unit}
                              </span>
                            </span>
                            <span className="font-medium text-on-surface">
                              {formatRupiah(Number(item.price_at_order) * Number(item.quantity))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  {order.status === "cancelled" ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                      Pesanan ini dibatalkan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Current status */}
                      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Status Order</p>
                      <button
                        type="button"
                        onClick={() => toggleDropdown(order.id)}
                        className="w-full flex items-center justify-between rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm text-primary font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <span className="flex flex-col items-start text-left">
                          <span>{ORDER_PROGRESS_STEPS[activeIndex]?.label ?? ORDER_STATUS_LABEL[order.status]}</span>
                          {order.status_histories && order.status_histories.length > 0 && (
                            <span className="text-xs font-normal text-primary/70">
                              {formatDateTime(order.status_histories[0].created_at)}
                            </span>
                          )}
                        </span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openDropdowns.has(order.id) ? "rotate-180" : ""}`} />
                      </button>

                      {/* Dropdown: semua step lainnya */}
                      {openDropdowns.has(order.id) && (
                        <div className="rounded-xl border border-outline-variant bg-surface-container-low divide-y divide-outline-variant overflow-hidden">
                          {ORDER_PROGRESS_STEPS.map((step, idx) => {
                            const isDone = idx < activeIndex;
                            const isCurrent = idx === activeIndex;
                            const history = order.status_histories?.find(
                              (entry) => entry.new_status === step.key,
                            );
                            return (
                              <div
                                key={step.key}
                                className={`flex items-center gap-3 px-4 py-2.5 text-xs ${
                                  isCurrent
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : isDone
                                      ? "text-green-700"
                                      : "text-on-surface-variant"
                                }`}
                              >
                                {isDone || isCurrent ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span className="flex-1">{step.label}</span>
                                {history && (
                                  <span className="text-on-surface-variant font-normal">
                                    {formatDateTime(history.created_at)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Payment CTA */}
                      {order.status === "waiting_payment" && order.payment?.status !== "paid" && (
                        <Link
                          href={`/customer/payment/${order.id}`}
                          className="block w-full text-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors"
                        >
                          Bayar Sekarang
                        </Link>
                      )}

                      {/* Confirm completion / complaint CTA */}
                      {order.status === "received_by_customer" && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => completeOrderMutation.mutate(order.id)}
                            disabled={completeOrderMutation.isPending}
                            className="flex-1 text-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
                          >
                            {completeOrderMutation.isPending && completeOrderMutation.variables === order.id
                              ? "Memproses..."
                              : "Pesanan Selesai"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setComplaintOrderId(order.id)}
                            className="flex-1 text-center rounded-xl border border-error px-4 py-3 text-sm font-bold text-error hover:bg-error/10 transition-colors"
                          >
                            Komplain
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <ComplaintModal
        open={complaintOrderId !== null}
        orderId={complaintOrderId}
        onClose={() => setComplaintOrderId(null)}
      />
    </div>
  );
}