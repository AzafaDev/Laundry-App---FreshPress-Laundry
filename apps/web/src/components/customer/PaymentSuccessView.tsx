"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList, Home } from "lucide-react";
import type { CustomerOrder } from "@/services/order.service";
import { formatRupiah } from "@/utils/formatPrice";
import { Navbar } from "@/components/layout/Navbar";
import { useTranslation } from "@/i18n/useTranslation";

const formatDateTime = (value: string | Date, locale: "id" | "en") =>
  new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

interface Props {
  order: CustomerOrder;
  payment: { status: string; paid_at?: string | null; amount?: string | number } | null | undefined;
}

export function PaymentSuccessView({ order, payment }: Props) {
  const { t, locale } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-12">
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 md:p-10 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">{t("payment.success.title")}</h1>
            <p className="text-sm text-on-surface-variant">
              {t("payment.success.thankYou", { invoice: order.invoice_number })}
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-4 space-y-2 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">{t("payment.success.invoiceNumber")}</span>
              <span className="font-medium text-on-surface">{order.invoice_number}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">{t("payment.success.outlet")}</span>
              <span className="font-medium text-on-surface">{order.outlet?.name ?? "-"}</span>
            </div>
            {payment?.paid_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">{t("payment.success.paidTime")}</span>
                <span className="font-medium text-on-surface">{formatDateTime(payment.paid_at, locale)}</span>
              </div>
            )}
            <div className="border-t border-dashed border-outline-variant my-1" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface">{t("payment.success.totalPaid")}</span>
              <span className="text-xl font-extrabold text-primary">
                {formatRupiah(Number(payment?.amount ?? order.total_price ?? 0))}
              </span>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant">{t("payment.success.willBePrepared")}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/customer/orders" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md">
              <ClipboardList className="w-4 h-4" />{t("payment.success.viewOrderStatus")}
            </Link>
            <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 py-3 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors">
              <Home className="w-4 h-4" />{t("payment.success.backHome")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
