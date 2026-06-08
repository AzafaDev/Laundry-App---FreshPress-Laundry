"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
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

const ORDER_STATUS_STYLE: Record<CustomerOrderStatus, string> = {
  waiting_pickup_driver: "bg-amber-100 text-amber-800",
  laundry_to_outlet: "bg-blue-100 text-blue-800",
  laundry_arrived_outlet: "bg-cyan-100 text-cyan-800",
  washing: "bg-sky-100 text-sky-800",
  ironing: "bg-indigo-100 text-indigo-800",
  packing: "bg-violet-100 text-violet-800",
  waiting_payment: "bg-orange-100 text-orange-800",
  ready_for_delivery: "bg-teal-100 text-teal-800",
  delivery_to_customer: "bg-pink-100 text-pink-800",
  received_by_customer: "bg-emerald-100 text-emerald-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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

export default function CustomerProgressPage() {
  const router = useRouter();
  const { accessToken, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) {
      router.replace("/customer/login?redirect=/customer/progress");
    }
  }, [_hasHydrated, accessToken, router]);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<CustomerOrder[]>({
    queryKey: ["customer", "orders"],
    queryFn: orderService.listOrders,
    enabled: _hasHydrated && !!accessToken,
    refetchInterval: 20_000,
  });

  if (!_hasHydrated || (!accessToken && !user)) {
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
                      <h3 className="text-base font-bold text-on-surface mt-1">
                        Pickup: {formatDateTime(order.pickup_schedule)}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Outlet: {order.outlet?.name ?? "-"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLE[order.status]}`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                      <p className="text-sm font-semibold text-on-surface">
                        {order.total_price !== null && order.total_price !== undefined
                          ? formatRupiah(Number(order.total_price))
                          : "Harga menyusul"}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  {order.status === "cancelled" ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                      Pesanan ini dibatalkan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Step grid */}
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {ORDER_PROGRESS_STEPS.map((step, idx) => {
                          const isDone = idx < activeIndex;
                          const isCurrent = idx === activeIndex;

                          return (
                            <div
                              key={`${order.id}-${step.key}`}
                              className={`rounded-xl border px-3 py-2 text-xs ${
                                isCurrent
                                  ? "border-primary bg-primary/10 text-primary"
                                  : isDone
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-outline-variant bg-surface-container-low text-on-surface-variant"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isDone || isCurrent ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span className="font-medium">{step.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Latest history */}
                      {order.status_histories && order.status_histories.length > 0 && (
                        <div className="rounded-xl bg-surface-container-low px-3 py-3 text-xs text-on-surface-variant space-y-1">
                          <p className="font-semibold text-on-surface">Update terbaru</p>
                          <p>
                            {ORDER_STATUS_LABEL[order.status_histories[0].new_status]}
                            {" — "}
                            {formatDateTime(order.status_histories[0].created_at)}
                          </p>
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
    </div>
  );
}