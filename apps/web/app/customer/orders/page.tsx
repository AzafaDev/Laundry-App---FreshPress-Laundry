"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ComplaintModal } from "@/components/customer/ComplaintModal";
import {
  orderService,
  type CustomerOrder,
  type CustomerOrderStatus,
  type ListCustomerOrdersQuery,
} from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";
import { formatRupiah } from "@/utils/formatPrice";

// ── constants ──────────────────────────────────────────────────────────────

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

const STATUS_FILTER_OPTIONS: Array<{ value: CustomerOrderStatus | ""; label: string }> = [
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

const ORDER_STATUS_LABEL = Object.fromEntries(
  ORDER_PROGRESS_STEPS.map((s) => [s.key, s.label])
) as Record<CustomerOrderStatus, string>;

const COMPLAINT_STATUS_LABEL: Record<string, string> = {
  in_progress: "Sedang Diproses",
  resolved: "Diselesaikan",
  rejected: "Ditolak",
};

const COMPLAINT_STATUS_COLOR: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

// ── helpers ────────────────────────────────────────────────────────────────

const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getProgressIndex = (status: CustomerOrderStatus) =>
  ORDER_PROGRESS_STEPS.findIndex((s) => s.key === status);

function formatWhatsApp(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  return cleaned;
}

// ── sub-components ─────────────────────────────────────────────────────────


function ComplaintReplySection({
  complaint,
  outletPhone,
}: {
  complaint: { status: string; resolution_notes: string | null };
  outletPhone?: string | null;
}) {
  if (complaint.status === "open") return null;
  const waNumber = outletPhone ? formatWhatsApp(outletPhone) : null;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
        Balasan Komplain
      </p>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${COMPLAINT_STATUS_COLOR[complaint.status] ?? "bg-surface-container text-on-surface-variant"}`}
      >
        {COMPLAINT_STATUS_LABEL[complaint.status] ?? complaint.status}
      </span>
      {complaint.resolution_notes && (
        <p className="text-sm text-on-surface leading-relaxed">{complaint.resolution_notes}</p>
      )}
      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Hubungi Admin via WhatsApp
        </a>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────

const LIMIT = 10;

export default function CustomerOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, _hasHydrated } = useAuthStore();

  // filter state
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerOrderStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  // UI state
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [complaintOrderId, setComplaintOrderId] = useState<string | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // debounce search input
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(value.trim());
      setPage(1);
    }, 400);
  };

  // reset page when filters change
  useEffect(() => { setPage(1); }, [status, dateFrom, dateTo]);

  const hasFilters = !!search || !!status || !!dateFrom || !!dateTo;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const toggleDropdown = (orderId: string) =>
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) router.replace("/customer/login");
  }, [_hasHydrated, user, router]);

  const query: ListCustomerOrdersQuery = {
    status: status || undefined,
    search: search || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    limit: LIMIT,
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["customer", "orders", query],
    queryFn: () => orderService.listOrders(query),
    enabled: _hasHydrated && !!user,
    // only auto-refresh when no filters active and on page 1 (active tracking view)
    refetchInterval: !hasFilters && page === 1 ? 20_000 : false,
  });

  const orders: CustomerOrder[] = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

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
                Riwayat Pesanan
              </span>
              <h1 className="text-3xl font-bold text-on-surface">Status laundry kamu.</h1>
              {!hasFilters && page === 1 && (
                <p className="text-sm text-on-surface-variant mt-1">
                  Diperbarui otomatis setiap 20 detik.
                </p>
              )}
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

        {/* Filter bar */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-4 space-y-3">
          {/* Search + status row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nomor invoice..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerOrderStatus | "")}
              className="sm:w-52 py-2.5 px-3 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <label className="text-xs text-on-surface-variant shrink-0">Dari</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 min-w-0 py-2 px-3 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
              />
              <label className="text-xs text-on-surface-variant shrink-0">s.d.</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 min-w-0 py-2 px-3 rounded-xl border border-outline-variant bg-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-error hover:underline shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                Hapus filter
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 flex items-center justify-center gap-3 text-sm text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Memuat pesanan...
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
            {hasFilters ? (
              <>
                <p className="font-semibold text-on-surface mb-1">Tidak ada pesanan ditemukan</p>
                <p className="text-sm text-on-surface-variant mb-5">
                  Coba ubah filter atau hapus pencarian.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-bold text-on-surface hover:border-primary hover:text-primary transition-colors"
                >
                  Hapus Filter
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}

        {/* Result count */}
        {!isLoading && !isError && orders.length > 0 && (
          <p className="text-xs text-on-surface-variant">
            Menampilkan {orders.length} dari {total} pesanan
          </p>
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
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Outlet: {order.outlet?.name ?? "-"}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Dibuat: {formatDateTime(order.created_at)}
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

                  {/* Laundry items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-3 space-y-2">
                      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                        Detail Item Laundry
                      </p>
                      <div className="space-y-1">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
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
                          <span className="text-primary">
                            {formatRupiah(Number(order.total_price ?? 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                      Status Order
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleDropdown(order.id)}
                      className="w-full flex items-center justify-between rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm text-primary font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <span className="flex flex-col items-start text-left">
                        <span>
                          {ORDER_PROGRESS_STEPS[activeIndex]?.label ??
                            ORDER_STATUS_LABEL[order.status]}
                        </span>
                        {order.status_histories && order.status_histories.length > 0 && (
                          <span className="text-xs font-normal text-primary/70">
                            {formatDateTime(order.status_histories[0].created_at)}
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${openDropdowns.has(order.id) ? "rotate-180" : ""}`}
                      />
                    </button>

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
                    {order.status === "waiting_payment" &&
                      order.payment?.status !== "paid" && (
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
                          {completeOrderMutation.isPending &&
                          completeOrderMutation.variables === order.id
                            ? "Memproses..."
                            : "Pesanan Selesai"}
                        </button>
                        {order.complaints && order.complaints.length > 0 ? (
                          <p className="flex-1 text-center rounded-xl border border-outline-variant px-4 py-3 text-sm font-semibold text-on-surface-variant">
                            Komplain sudah diajukan
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setComplaintOrderId(order.id)}
                            className="flex-1 text-center rounded-xl border border-error px-4 py-3 text-sm font-bold text-error hover:bg-error/10 transition-colors"
                          >
                            Komplain
                          </button>
                        )}
                      </div>
                    )}

                    {/* Admin reply section */}
                    {order.complaints && order.complaints.length > 0 && (
                      <ComplaintReplySection
                        complaint={order.complaints[0]}
                        outletPhone={order.outlet?.phone}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            <span className="text-sm text-on-surface-variant px-2">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
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
