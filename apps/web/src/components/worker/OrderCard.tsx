"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, Clock3, Loader2, Eye, XCircle } from "lucide-react";
import type { StationOrder } from "@/services/workerStation.service";
import { statusLabel, type BypassState } from "./stationConfig";

function computeWaiting(createdAt: string): { label: string; urgent: boolean } {
  const diffMin = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diffMin < 30) return { label: `${diffMin} mnt lalu`, urgent: false };
  if (diffMin < 60) return { label: `${diffMin} mnt lalu`, urgent: true };
  const hours = Math.floor(diffMin / 60);
  return { label: `${hours} jam lalu`, urgent: true };
}

function PendingBypassBanner() {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 mt-3">
      <Clock3 className="w-4 h-4 text-amber-600 shrink-0" />
      <p className="text-sm text-amber-700 font-medium">Menunggu persetujuan admin</p>
    </div>
  );
}

function RejectedBypassBanner({ notes }: { notes?: string | null }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 mt-3">
      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-red-700 font-medium">Bypass ditolak</p>
        {notes && <p className="text-xs text-red-500 mt-0.5">{notes}</p>}
      </div>
    </div>
  );
}

export function OrderCard({
  order,
  onProcess,
  isProcessing,
  bypassState,
  onViewBypass,
}: {
  order: StationOrder;
  onProcess: (id: string) => void;
  isProcessing: boolean;
  bypassState?: BypassState;
  onViewBypass?: (id: string) => void;
}) {
  const [waiting, setWaiting] = useState<{ label: string; urgent: boolean }>({ label: "", urgent: false });
  useEffect(() => {
    setWaiting(computeWaiting(order.created_at));
    const timer = setInterval(() => setWaiting(computeWaiting(order.created_at)), 60000);
    return () => clearInterval(timer);
  }, [order.created_at]);

  const rawStatus = statusLabel[order.status] ?? order.status;
  const isPendingBypass = bypassState?.submitted || order.bypassStatus === "pending";
  const isRejectedBypass = !bypassState?.submitted && order.bypassStatus === "rejected";

  return (
    <div
      className={`bg-surface border rounded-xl p-4 shadow-sm transition-all ${
        waiting.urgent ? "border-amber-200 bg-amber-50/30" : "border-outline-variant"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            #{order.invoice_number}
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full border border-outline-variant">
            {rawStatus}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-medium shrink-0 ${
            waiting.urgent ? "text-amber-600" : "text-on-surface-variant"
          }`}
        >
          {waiting.urgent && <AlertCircle className="w-3 h-3" />}
          <Clock className="w-3 h-3" />
          {waiting.label}
        </div>
      </div>

      <h3 className="text-base font-bold text-on-surface">{order.customer.full_name}</h3>
      <p className="text-sm text-on-surface-variant mt-0.5 mb-4">
        {order.order_item_breakdowns.length} jenis item
        {order.total_weight_kg ? ` • ${order.total_weight_kg} kg` : ""}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {order.order_item_breakdowns.slice(0, 3).map((item) => (
          <span
            key={item.id}
            className="text-xs bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-md border border-outline-variant"
          >
            {item.clothing_type.name} ×{item.quantity}
          </span>
        ))}
        {order.order_item_breakdowns.length > 3 && (
          <span className="text-xs text-on-surface-variant px-1">
            +{order.order_item_breakdowns.length - 3} lagi
          </span>
        )}
      </div>

      {isPendingBypass ? (
        <>
          <PendingBypassBanner />
          {onViewBypass && (
            <button
              onClick={() => onViewBypass(order.id)}
              className="w-full mt-2 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Lihat Detail Bypass
            </button>
          )}
        </>
      ) : isRejectedBypass ? (
        <>
          <RejectedBypassBanner notes={order.bypassAdminNotes} />
          <button
            onClick={() => onProcess(order.id)}
            disabled={isProcessing}
            className="w-full mt-2 py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {isProcessing ? "Memproses..." : "Verifikasi Items"}
          </button>
        </>
      ) : (
        <button
          onClick={() => onProcess(order.id)}
          disabled={isProcessing}
          className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isProcessing ? "Memproses..." : "Verifikasi Items"}
        </button>
      )}
    </div>
  );
}
