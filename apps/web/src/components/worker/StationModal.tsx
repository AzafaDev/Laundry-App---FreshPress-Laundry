"use client";

import { useState } from "react";
import { X, AlertTriangle, Package, CheckCircle2, Loader2 } from "lucide-react";
import type { StationOrder } from "@/services/workerStation.service";

interface StationModalProps {
  orderId: string;
  orders: StationOrder[];
  onClose: () => void;
  onConfirm: (orderId: string, receivedQuantities: Record<string, number>) => void;
  isProcessing: boolean;
}

export function StationModal({ orderId, orders, onClose, onConfirm, isProcessing }: StationModalProps) {
  const order = orders.find((o) => o.id === orderId);
  const [received, setReceived] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (order) {
      for (const item of order.order_items) {
        initial[item.id] = item.quantity;
      }
    }
    return initial;
  });
  const [mismatches, setMismatches] = useState<string[]>([]);

  if (!order) return null;

  const handleChange = (itemId: string, value: number) => {
    const clamped = Math.max(0, value);
    setReceived((prev) => ({ ...prev, [itemId]: clamped }));
    const item = order.order_items.find((i) => i.id === itemId);
    if (item && clamped !== item.quantity) {
      setMismatches((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
    } else {
      setMismatches((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const hasAnyMismatch = mismatches.length > 0;
  const allMatch = mismatches.length === 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest w-full sm:max-w-[32rem] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-outline-variant flex flex-col max-h-[90dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Verifikasi Item</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Order <span className="font-semibold text-primary">#{order.invoice_number}</span>
              {" · "}{order.customer.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item list */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2.5">
          <p className="text-xs font-medium text-on-surface-variant mb-3">
            Masukkan jumlah item yang diterima:
          </p>
          {order.order_items.map((item) => {
            const expected = item.quantity;
            const receivedValue = received[item.id] ?? expected;
            const isMismatch = receivedValue !== expected;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  isMismatch
                    ? "bg-error/5 border-error/20"
                    : "bg-surface-container-low border-outline-variant"
                }`}
              >
                <div className="p-1.5 rounded-lg bg-surface-container">
                  <Package className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {item.laundry_item.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Ekspektasi: <span className="font-medium">{expected} {item.laundry_item.unit}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    value={receivedValue}
                    onChange={(e) => handleChange(item.id, parseInt(e.target.value) || 0)}
                    className={`w-16 px-2 py-1.5 border rounded-lg text-center text-sm font-bold focus:outline-none focus:ring-2 ${
                      isMismatch
                        ? "border-error/50 bg-error/5 text-error focus:ring-error/30"
                        : "border-outline-variant bg-surface focus:ring-primary/30"
                    }`}
                    min="0"
                  />
                  {isMismatch ? (
                    <AlertTriangle className="w-4 h-4 text-error" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>
            );
          })}

          {hasAnyMismatch && (
            <div className="flex items-start gap-2.5 p-3 bg-error/8 border border-error/20 rounded-xl mt-2">
              <AlertTriangle className="w-4 h-4 text-error mt-0.5 shrink-0" />
              <p className="text-sm text-error">
                Ada {mismatches.length} item yang jumlahnya tidak sesuai. Anda tetap bisa melanjutkan — sistem akan mencatat ketidaksesuaian ini.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(order.id, received)}
            disabled={isProcessing}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
              allMatch
                ? "bg-primary text-on-primary hover:opacity-90"
                : "bg-amber-500 text-white hover:opacity-90"
            }`}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
            ) : allMatch ? (
              <><CheckCircle2 className="w-4 h-4" /> Konfirmasi</>
            ) : (
              <><AlertTriangle className="w-4 h-4" /> Lanjut dengan catatan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
