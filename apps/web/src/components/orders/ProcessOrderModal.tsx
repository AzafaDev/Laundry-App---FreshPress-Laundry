"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useLaundryItems } from "@/hooks/useLaundryItems";
import { useProcessOrder } from "@/hooks/useOrders";

interface ItemRow {
  laundry_item_id: string;
  quantity: number;
}

interface Props {
  orderId: string;
  invoiceNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProcessOrderModal({ orderId, invoiceNumber, onClose, onSuccess }: Props) {
  const { data: itemsData } = useLaundryItems({ is_active: true, limit: 100 });
  const laundryItems = itemsData?.data ?? [];

  const processOrder = useProcessOrder(orderId);

  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([{ laundry_item_id: "", quantity: 1 }]);
  const [error, setError] = useState("");

  const addRow = () => setRows((r) => [...r, { laundry_item_id: "", quantity: 1 }]);

  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    setRows((r) => r.filter((_, idx) => idx !== i));
  };

  const updateRow = (i: number, field: keyof ItemRow, val: string | number) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const fmtPrice = (v: string | number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(v));

  const selectedItems = rows.map((r) => ({
    ...r,
    item: laundryItems.find((li) => li.id === r.laundry_item_id),
  }));

  const subtotal = selectedItems.reduce(
    (sum, r) => sum + (r.item ? Number(r.item.base_price) * r.quantity : 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!weightKg || Number(weightKg) <= 0) {
      return setError("Total berat harus lebih dari 0 kg.");
    }
    const validRows = rows.filter((r) => r.laundry_item_id);
    if (validRows.length === 0) {
      return setError("Minimal satu item harus dipilih.");
    }
    const hasDup = new Set(validRows.map((r) => r.laundry_item_id)).size !== validRows.length;
    if (hasDup) return setError("Item tidak boleh duplikat.");

    try {
      await processOrder.mutateAsync({
        total_weight_kg: Number(weightKg),
        items: validRows.map((r) => ({
          laundry_item_id: r.laundry_item_id,
          quantity: r.quantity,
        })),
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Gagal memproses order.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant shrink-0">
          <div>
            <h3 className="font-bold text-lg">Proses Order</h3>
            <p className="text-xs text-on-surface-variant">{invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-5">
          {error && (
            <p className="text-sm text-error bg-error-container text-on-error-container px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Berat (kg) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="cth. 3.5"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Item Pakaian <span className="text-error">*</span>
              </label>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="w-3 h-3" /> Tambah Item
              </button>
            </div>

            <div className="space-y-2">
              {rows.map((row, i) => {
                const selectedItem = laundryItems.find((li) => li.id === row.laundry_item_id);
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <select
                        value={row.laundry_item_id}
                        onChange={(e) => updateRow(i, "laundry_item_id", e.target.value)}
                        className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                      >
                        <option value="">Pilih item...</option>
                        {laundryItems.map((li) => (
                          <option key={li.id} value={li.id}>
                            {li.name} ({li.unit}) — {fmtPrice(li.base_price)}
                          </option>
                        ))}
                      </select>
                      {selectedItem && (
                        <p className="text-xs text-on-surface-variant mt-0.5 ml-1">
                          Subtotal: {fmtPrice(Number(selectedItem.base_price) * row.quantity)}
                        </p>
                      )}
                    </div>
                    <div className="w-20 shrink-0">
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(i, "quantity", Number(e.target.value))}
                        className="w-full px-2 py-2 border border-outline-variant rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      disabled={rows.length <= 1}
                      className="p-2 text-error hover:bg-error-container rounded-lg disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price summary */}
          {subtotal > 0 && (
            <div className="bg-surface-container-low rounded-lg px-4 py-3 flex justify-between text-sm">
              <span className="text-on-surface-variant">Estimasi Total</span>
              <span className="font-bold">{fmtPrice(subtotal)}</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan tambahan untuk order ini..."
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-2 p-5 border-t border-outline-variant shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-high"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={processOrder.isPending}
            className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {processOrder.isPending ? "Memproses..." : "Proses & Mulai Cuci"}
          </button>
        </div>
      </div>
    </div>
  );
}
