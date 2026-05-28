"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { StationOrder } from "@/services/workerStation.service";

interface StationModalProps {
  orderId: string;
  orders: StationOrder[];
  onClose: () => void;
  onConfirm: (orderId: string, receivedQuantities: Record<string, number>) => void;
  isProcessing: boolean;
}

export function StationModal({ orderId, orders, onClose, onConfirm, isProcessing }: StationModalProps) {
  const order = orders.find(o => o.id === orderId);
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
    setReceived(prev => ({ ...prev, [itemId]: value }));
    const item = order.order_items.find(i => i.id === itemId);
    if (item && value !== item.quantity) {
      if (!mismatches.includes(itemId)) setMismatches(prev => [...prev, itemId]);
    } else {
      setMismatches(prev => prev.filter(id => id !== itemId));
    }
  };

  const hasAnyMismatch = mismatches.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-outline-variant">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Verifikasi Item</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-on-surface-variant">Order: <strong>{order.invoice_number}</strong></p>
          <div className="space-y-3">
            {order.order_items.map((item) => {
              const expected = item.quantity;
              const receivedValue = received[item.id] ?? expected;
              const isMismatch = receivedValue !== expected;
              return (
                <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-surface-container-low rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.laundry_item.name}</p>
                    <p className="text-xs text-on-surface-variant">Expected: {expected}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={receivedValue}
                      onChange={(e) => handleChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-outline-variant rounded-lg text-center"
                      min="0"
                    />
                    {isMismatch && <AlertTriangle className="w-5 h-5 text-error" />}
                  </div>
                </div>
              );
            })}
          </div>

          {hasAnyMismatch && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-error mt-0.5" />
              <p className="text-sm text-error">
                Terdapat ketidaksesuaian jumlah. Anda tetap dapat melanjutkan, namun bypass request akan diimplementasikan di sprint berikutnya.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-surface-container-low flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-outline-variant rounded-lg font-medium">
            Batal
          </button>
          <button
            onClick={() => onConfirm(order.id, received)}
            disabled={isProcessing}
            className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isProcessing ? "Memproses..." : "Konfirmasi & Lanjutkan"}
          </button>
        </div>
      </div>
    </div>
  );
}