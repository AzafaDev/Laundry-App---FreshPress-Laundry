"use client";

import { useState } from "react";
import { X, AlertTriangle, Package, CheckCircle2, Loader2, Shirt, Tag } from "lucide-react";
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

  const breakdownItems = order?.order_item_breakdowns ?? [];
  const pcsItems = (order?.order_items ?? []).filter((i) => i.laundry_item.unit === "pcs");

  const [received, setReceived] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const item of breakdownItems) {
      initial[item.id] = item.quantity;
    }
    return initial;
  });

  if (!order) return null;

  const mismatchIds = breakdownItems
    .filter((item) => (received[item.id] ?? item.quantity) !== item.quantity)
    .map((item) => item.id);

  const hasAnyMismatch = mismatchIds.length > 0;

  const handleChange = (itemId: string, value: number) => {
    setReceived((prev) => ({ ...prev, [itemId]: Math.max(0, value) }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Pcs Items Section (read-only) */}
          {pcsItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Tag className="w-3.5 h-3.5 text-on-surface-variant" />
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  Item Satuan (referensi)
                </p>
              </div>
              <div className="space-y-2">
                {pcsItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface-container-low"
                  >
                    <div className="p-1.5 rounded-lg bg-surface-container">
                      <Tag className="w-4 h-4 text-on-surface-variant" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {item.laundry_item.name}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-on-surface shrink-0">
                      {item.quantity} pcs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown Section */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Shirt className="w-3.5 h-3.5 text-on-surface-variant" />
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                Item (masukkan jumlah aktual)
              </p>
            </div>

            {breakdownItems.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant text-sm text-on-surface-variant">
                <Package className="w-4 h-4 shrink-0" />
                Belum ada breakdown item dari outlet admin.
              </div>
            ) : (
              <div className="space-y-2">
                {breakdownItems.map((item) => {
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
                          {item.clothing_type.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Ekspektasi: <span className="font-medium">{expected} pcs</span>
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
              </div>
            )}
          </div>

          {hasAnyMismatch && (
            <div className="flex items-start gap-2.5 p-3 bg-error/8 border border-error/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-error mt-0.5 shrink-0" />
              <p className="text-sm text-error">
                Ada {mismatchIds.length} item yang jumlahnya tidak sesuai. Sistem akan membuka form bypass untuk persetujuan admin.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(order.id, received)}
            disabled={isProcessing}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
              hasAnyMismatch
                ? "bg-amber-500 text-white hover:opacity-90"
                : "bg-primary text-on-primary hover:opacity-90"
            }`}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
            ) : hasAnyMismatch ? (
              <><AlertTriangle className="w-4 h-4" /> Lanjut & Ajukan Bypass</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Verifikasi</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
