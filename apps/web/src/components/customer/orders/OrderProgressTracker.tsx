"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle, BadgeCheck } from "lucide-react";
import type { CustomerOrder, CustomerOrderStatus } from "@/services/order.service";
import {
  formatDateTime,
  ORDER_PROGRESS_STATUS_KEYS,
} from "./orderConstants";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  order: CustomerOrder;
  isOpen: boolean;
  onToggle: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  onComplaint: () => void;
}

const PAYABLE_STATUSES: CustomerOrderStatus[] = ["washing", "ironing", "packing", "waiting_payment"];

export function OrderProgressTracker({ order, isOpen, onToggle, onComplete, isCompleting, onComplaint }: Props) {
  const { t, locale } = useTranslation();
  const paidEarly = order.payment?.status === "paid" && ["washing", "ironing", "packing"].includes(order.status);
  const visibleSteps = (paidEarly
    ? ORDER_PROGRESS_STATUS_KEYS.filter((key) => key !== "waiting_payment")
    : ORDER_PROGRESS_STATUS_KEYS
  ).map((key) => ({ key, label: t(`orders.progressStatus.${key}`) }));
  const activeIndex = Math.max(0, visibleSteps.findIndex((s) => s.key === order.status));

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">{t("orders.card.status")}</p>

      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm text-primary font-semibold hover:bg-primary/20 transition-colors"
      >
        <span className="flex flex-col items-start text-left">
          <span>{visibleSteps[activeIndex]?.label ?? t(`orders.progressStatus.${order.status}`)}</span>
          {order.status_histories && order.status_histories.length > 0 && (
            <span className="text-xs font-normal text-primary/70">
              {formatDateTime(order.status_histories[0].created_at, locale)}
            </span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low divide-y divide-outline-variant overflow-hidden">
          {visibleSteps.map((step, idx) => {
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const history = order.status_histories?.find((e) => e.new_status === step.key);
            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 px-4 py-2.5 text-xs ${isCurrent ? "bg-primary/10 text-primary font-semibold" : isDone ? "text-green-700" : "text-on-surface-variant"}`}
              >
                {isDone || isCurrent ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                <span className="flex-1">{step.label}</span>
                {history && <span className="text-on-surface-variant font-normal">{formatDateTime(history.created_at, locale)}</span>}
              </div>
            );
          })}
        </div>
      )}

      {PAYABLE_STATUSES.includes(order.status) && order.total_price && (
        order.payment?.status === "paid" ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            <span>
              {t("orders.card.paid")}
              {order.payment?.paid_at && (
                <span className="block text-xs font-normal text-green-600">
                  {formatDateTime(order.payment.paid_at, locale)}
                </span>
              )}
            </span>
          </div>
        ) : (
          <Link
            href={`/customer/payment/${order.id}`}
            className="block w-full text-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            {t("orders.card.payNow")}
          </Link>
        )
      )}

      {order.status === "received_by_customer" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onComplete}
            disabled={isCompleting}
            className="flex-1 text-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
          >
            {isCompleting ? t("orders.card.processing") : t("orders.card.orderComplete")}
          </button>
          {order.complaints && order.complaints.length > 0 ? (
            <p className="flex-1 text-center rounded-xl border border-outline-variant px-4 py-3 text-sm font-semibold text-on-surface-variant">
              {t("orders.card.complaintFiled")}
            </p>
          ) : (
            <button
              type="button"
              onClick={onComplaint}
              className="flex-1 text-center rounded-xl border border-error px-4 py-3 text-sm font-bold text-error hover:bg-error/10 transition-colors"
            >
              {t("orders.card.complaint")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
