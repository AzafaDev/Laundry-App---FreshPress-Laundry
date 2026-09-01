"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, CreditCard, Loader2, Wallet } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { orderService, type CustomerOrder } from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";
import { formatRupiah } from "@/utils/formatPrice";
import { useTranslation } from "@/i18n/useTranslation";

const formatDateTime = (value: string | Date, locale: "id" | "en") =>
  new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function CustomerPaymentLandingPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/customer/login");
    }
  }, [_hasHydrated, user, router]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customer", "orders"],
    queryFn: () => orderService.listOrders(),
    enabled: _hasHydrated && !!user,
  });

  const orders: CustomerOrder[] = data?.orders ?? [];

  const unpaidOrders = orders.filter(
    (order) => order.status === "waiting_payment" && order.payment?.status !== "paid",
  );

  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">{t("payment.preparingPage")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">
            {t("payment.badge")}
          </span>
          <h1 className="text-3xl font-bold text-on-surface">{t("payment.listTitle")}</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t("payment.listSubtitle")}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 flex items-center justify-center gap-3 text-sm text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            {t("payment.loadingBills")}
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
            {t("payment.loadError")}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && unpaidOrders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-outline" />
            </div>
            <p className="font-semibold text-on-surface mb-1">{t("payment.noBillsTitle")}</p>
            <p className="text-sm text-on-surface-variant mb-5">
              {t("payment.noBillsDesc")}
            </p>
            <Link
              href="/customer/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-container transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              {t("payment.viewMyOrders")}
            </Link>
          </div>
        )}

        {/* Unpaid order list */}
        {!isLoading && !isError && unpaidOrders.length > 0 && (
          <div className="space-y-4">
            {unpaidOrders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/payment/${order.id}`}
                className="block rounded-2xl border border-outline-variant bg-surface p-4 md:p-6 shadow-sm hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">
                      {order.invoice_number}
                    </p>
                    <h3 className="text-base font-bold text-on-surface mt-1">
                      {t("payment.outlet", { name: order.outlet?.name ?? "-" })}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {t("payment.pickup", { date: order.pickup_schedule ? formatDateTime(order.pickup_schedule, locale) : "-" })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 shrink-0">
                    {t("payment.waitingPayment")}
                  </span>
                </div>

                <div className="border-t border-dashed border-outline-variant my-3" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">{t("payment.totalBill")}</span>
                  <span className="text-xl font-extrabold text-primary">
                    {order.total_price !== null && order.total_price !== undefined
                      ? formatRupiah(Number(order.total_price))
                      : "-"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">
                  <CreditCard className="w-4 h-4" />
                  {t("payment.payNow")}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
