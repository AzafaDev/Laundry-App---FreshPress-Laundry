"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ComplaintModal } from "@/components/customer/ComplaintModal";
import { orderService, type CustomerOrder, type CustomerOrderStatus, type ListCustomerOrdersQuery } from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";
import { OrderFilters } from "@/components/customer/orders/OrderFilters";
import { OrderCard } from "@/components/customer/orders/OrderCard";
import { useTranslation } from "@/i18n/useTranslation";

const LIMIT = 10;

export default function CustomerOrdersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, _hasHydrated } = useAuthStore();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerOrderStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [complaintOrderId, setComplaintOrderId] = useState<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => { setSearch(value.trim()); setPage(1); }, 400);
  };

  useEffect(() => { setPage(1); }, [status, dateFrom, dateTo]);

  const hasFilters = !!search || !!status || !!dateFrom || !!dateTo;

  const clearFilters = () => {
    setSearchInput(""); setSearch(""); setStatus(""); setDateFrom(""); setDateTo(""); setPage(1);
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

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["customer", "orders", query],
    queryFn: () => orderService.listOrders(query),
    enabled: _hasHydrated && !!user,
    refetchInterval: !hasFilters && page === 1 ? 20_000 : false,
  });

  const orders: CustomerOrder[] = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const completeOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.completeOrder(orderId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customer", "orders"] }); },
  });

  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">{t("orders.preparingPage")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="space-y-4">
          <Link href="/customer/pickup" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />{t("orders.createNew")}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">{t("orders.badge")}</span>
              <h1 className="text-3xl font-bold text-on-surface">{t("orders.title")}</h1>
              {!hasFilters && page === 1 && <p className="text-sm text-on-surface-variant mt-1">{t("orders.autoRefresh")}</p>}
            </div>
            <button onClick={() => void refetch()} disabled={isFetching} className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />{t("orders.refresh")}
            </button>
          </div>
        </div>

        <OrderFilters searchInput={searchInput} status={status} dateFrom={dateFrom} dateTo={dateTo} hasFilters={hasFilters} onSearchChange={handleSearchChange} onStatusChange={setStatus} onDateFromChange={setDateFrom} onDateToChange={setDateTo} onClear={clearFilters} />

        {isLoading && (
          <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 flex items-center justify-center gap-3 text-sm text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />{t("orders.loading")}
          </div>
        )}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
            <p className="font-semibold mb-2">{t("orders.loadError")}</p>
            <button onClick={() => void refetch()} className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors">{t("orders.retry")}</button>
          </div>
        )}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-outline" />
            </div>
            {hasFilters ? (
              <>
                <p className="font-semibold text-on-surface mb-1">{t("orders.noOrdersFilteredTitle")}</p>
                <p className="text-sm text-on-surface-variant mb-5">{t("orders.noOrdersFilteredDesc")}</p>
                <button onClick={clearFilters} className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-bold text-on-surface hover:border-primary hover:text-primary transition-colors">{t("orders.clearFilters")}</button>
              </>
            ) : (
              <>
                <p className="font-semibold text-on-surface mb-1">{t("orders.noOrdersTitle")}</p>
                <p className="text-sm text-on-surface-variant mb-5">{t("orders.noOrdersDesc")}</p>
                <Link href="/customer/order" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-container transition-colors">{t("orders.orderNow")}</Link>
              </>
            )}
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <p className="text-xs text-on-surface-variant">{t("orders.showing", { shown: orders.length, total })}</p>
        )}
        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isDropdownOpen={openDropdowns.has(order.id)}
                onToggleDropdown={() => toggleDropdown(order.id)}
                onComplete={() => completeOrderMutation.mutate(order.id)}
                isCompleting={completeOrderMutation.isPending && completeOrderMutation.variables === order.id}
                onComplaint={() => setComplaintOrderId(order.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" />{t("orders.previous")}
            </button>
            <span className="text-sm text-on-surface-variant px-2">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors">
              {t("orders.next")}<ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <ComplaintModal open={complaintOrderId !== null} orderId={complaintOrderId} onClose={() => setComplaintOrderId(null)} />
    </div>
  );
}
