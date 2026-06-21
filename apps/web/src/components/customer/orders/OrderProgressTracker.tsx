"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import type { CustomerOrder } from "@/services/order.service";
import {
  formatDateTime,
  getProgressIndex,
  ORDER_PROGRESS_STEPS,
  ORDER_STATUS_LABEL,
} from "./orderConstants";

interface Props {
  order: CustomerOrder;
  isOpen: boolean;
  onToggle: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  onComplaint: () => void;
}

export function OrderProgressTracker({ order, isOpen, onToggle, onComplete, isCompleting, onComplaint }: Props) {
  const progressIndex = getProgressIndex(order.status);
  const activeIndex = progressIndex >= 0 ? progressIndex : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">Status Order</p>

      <button
        type="button"
        onClick={onToggle}
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
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low divide-y divide-outline-variant overflow-hidden">
          {ORDER_PROGRESS_STEPS.map((step, idx) => {
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
                {history && <span className="text-on-surface-variant font-normal">{formatDateTime(history.created_at)}</span>}
              </div>
            );
          })}
        </div>
      )}

      {order.status === "waiting_payment" && order.payment?.status !== "paid" && (
        <Link
          href={`/customer/payment/${order.id}`}
          className="block w-full text-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors"
        >
          Bayar Sekarang
        </Link>
      )}

      {order.status === "received_by_customer" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onComplete}
            disabled={isCompleting}
            className="flex-1 text-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
          >
            {isCompleting ? "Memproses..." : "Pesanan Selesai"}
          </button>
          {order.complaints && order.complaints.length > 0 ? (
            <p className="flex-1 text-center rounded-xl border border-outline-variant px-4 py-3 text-sm font-semibold text-on-surface-variant">
              Komplain sudah diajukan
            </p>
          ) : (
            <button
              type="button"
              onClick={onComplaint}
              className="flex-1 text-center rounded-xl border border-error px-4 py-3 text-sm font-bold text-error hover:bg-error/10 transition-colors"
            >
              Komplain
            </button>
          )}
        </div>
      )}
    </div>
  );
}
