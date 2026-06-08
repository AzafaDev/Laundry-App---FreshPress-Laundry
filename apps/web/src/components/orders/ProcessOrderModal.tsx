"use client";

import { useState, useMemo } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLaundryItems } from "@/hooks/useLaundryItems";
import { useProcessOrder } from "@/hooks/useOrders";
import type { LaundryItem } from "@/types/laundryItem.types";

interface Props {
  orderId: string;
  invoiceNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "form" | "confirm";

const fmtPrice = (v: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(v));

export function ProcessOrderModal({ orderId, invoiceNumber, onClose, onSuccess }: Props) {
  const { data: itemsData } = useLaundryItems({ is_active: true, limit: 100 });
  const allItems: LaundryItem[] = itemsData?.data ?? [];

  const kgItems  = allItems.filter((i) => i.unit === "kg");
  const pcsItems = allItems.filter((i) => i.unit !== "kg");

  const processOrder = useProcessOrder(orderId);

  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");

  // kg-item weights: itemId → weight (number)
  const [kgQtys, setKgQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(kgItems.map((i) => [i.id, 0])),
  );

  // pcs-item counts: itemId → count (number)
  const [pcsQtys, setPcsQtys] = useState<Record<string, number>>(() =>
    Object.fromEntries(pcsItems.map((i) => [i.id, 0])),
  );

  // Manual "Total Item" (pcs) — NOT auto-calculated
  const [totalItemPcs, setTotalItemPcs] = useState<string>("");
  // Optional description / notes
  const [deskripsi, setDeskripsi] = useState("");

  const totalWeightKg = useMemo(
    () => kgItems.reduce((sum, i) => sum + (kgQtys[i.id] ?? 0), 0),
    [kgItems, kgQtys],
  );

  const kgSubtotals = useMemo(
    () => kgItems.map((i) => ({ item: i, qty: kgQtys[i.id] ?? 0, sub: (kgQtys[i.id] ?? 0) * Number(i.base_price) })),
    [kgItems, kgQtys],
  );

  const pcsSubtotals = useMemo(
    () => pcsItems.map((i) => ({ item: i, qty: pcsQtys[i.id] ?? 0, sub: (pcsQtys[i.id] ?? 0) * Number(i.base_price) })),
    [pcsItems, pcsQtys],
  );

  const grandTotal = useMemo(
    () => [...kgSubtotals, ...pcsSubtotals].reduce((s, r) => s + r.sub, 0),
    [kgSubtotals, pcsSubtotals],
  );

  // Build items array for API (exclude zero-qty)
  const apiItems = useMemo(() => {
    const kg = kgItems
      .filter((i) => (kgQtys[i.id] ?? 0) > 0)
      .map((i) => ({ laundry_item_id: i.id, quantity: kgQtys[i.id] }));
    const pcs = pcsItems
      .filter((i) => (pcsQtys[i.id] ?? 0) > 0)
      .map((i) => ({ laundry_item_id: i.id, quantity: pcsQtys[i.id] }));
    return [...kg, ...pcs];
  }, [kgItems, pcsItems, kgQtys, pcsQtys]);

  // Compose notes: include Total Item + deskripsi
  const composeNotes = () => {
    const parts: string[] = [];
    if (totalItemPcs) parts.push(`Total Item: ${totalItemPcs} pcs`);
    if (deskripsi.trim()) parts.push(deskripsi.trim());
    return parts.join(" | ") || undefined;
  };

  const handleReview = () => {
    setError("");
    if (totalWeightKg <= 0 && apiItems.filter((i) => {
      const li = allItems.find((a) => a.id === i.laundry_item_id);
      return li?.unit !== "kg";
    }).length === 0) {
      return setError("Isi minimal satu item kiloan atau satuan.");
    }
    if (apiItems.length === 0) {
      return setError("Minimal satu item harus diisi.");
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setError("");
    try {
      await processOrder.mutateAsync({
        total_weight_kg: totalWeightKg > 0 ? totalWeightKg : 0.01,
        items: apiItems,
        notes: composeNotes(),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Gagal memproses order.");
      setStep("form");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0">
          <div>
            <h3 className="font-bold text-lg">
              {step === "form" ? "Proses Order" : "Konfirmasi Order"}
            </h3>
            <p className="text-xs text-on-surface-variant">{invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            disabled={processOrder.isPending}
            className="p-1.5 rounded-lg hover:bg-surface-container-high disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── STEP 1: Form ──────────────────────────────────────────────────── */}
        {step === "form" && (
          <>
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {error && (
                <p className="text-sm text-error bg-error-container text-on-error-container px-3 py-2 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}

              {/* ── KILOAN section ── */}
              {kgItems.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Kiloan
                  </p>
                  <div className="border border-outline-variant rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          <th className="text-left px-4 py-2.5 font-semibold text-on-surface-variant">Jenis Laundry</th>
                          <th className="text-center px-4 py-2.5 font-semibold text-on-surface-variant w-28">Berat (KG)</th>
                          <th className="text-right px-4 py-2.5 font-semibold text-on-surface-variant w-32">Harga (Rp.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {kgItems.map((item) => {
                          const qty = kgQtys[item.id] ?? 0;
                          const sub = qty * Number(item.base_price);
                          return (
                            <tr key={item.id}>
                              <td className="px-4 py-2.5">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-on-surface-variant ml-1.5">
                                  ({fmtPrice(item.base_price)}/kg)
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  value={qty || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setKgQtys((prev) => ({
                                      ...prev,
                                      [item.id]: Math.max(0, parseFloat(e.target.value) || 0),
                                    }))
                                  }
                                  className="w-full text-center border border-outline-variant rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                                />
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium">
                                {sub > 0 ? fmtPrice(sub) : <span className="text-on-surface-variant">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Item + Deskripsi — manual, not auto-calculated */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">
                        Total Item
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={totalItemPcs}
                        placeholder="cth. 5"
                        onChange={(e) => setTotalItemPcs(e.target.value)}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">
                        Deskripsi
                      </label>
                      <input
                        type="text"
                        value={deskripsi}
                        placeholder="cth. pakaian dewasa"
                        onChange={(e) => setDeskripsi(e.target.value)}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── SATUAN section ── */}
              {pcsItems.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                    Satuan
                  </p>
                  <div className="border border-outline-variant rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container-low">
                        <tr>
                          <th className="text-left px-4 py-2.5 font-semibold text-on-surface-variant">Jenis Pakaian</th>
                          <th className="text-center px-4 py-2.5 font-semibold text-on-surface-variant w-28">Jumlah Potong</th>
                          <th className="text-right px-4 py-2.5 font-semibold text-on-surface-variant w-32">Harga (Rp.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {pcsItems.map((item) => {
                          const qty = pcsQtys[item.id] ?? 0;
                          const sub = qty * Number(item.base_price);
                          return (
                            <tr key={item.id}>
                              <td className="px-4 py-2.5">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-on-surface-variant ml-1.5">
                                  ({fmtPrice(item.base_price)}/pcs)
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={qty || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setPcsQtys((prev) => ({
                                      ...prev,
                                      [item.id]: Math.max(0, parseInt(e.target.value) || 0),
                                    }))
                                  }
                                  className="w-full text-center border border-outline-variant rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                                />
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium">
                                {sub > 0 ? fmtPrice(sub) : <span className="text-on-surface-variant">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Grand total */}
              {grandTotal > 0 && (
                <div className="flex justify-between items-center px-4 py-3 bg-surface-container-low rounded-xl text-sm border border-outline-variant">
                  <span className="text-on-surface-variant font-medium">Estimasi Total</span>
                  <span className="font-bold text-primary text-base">{fmtPrice(grandTotal)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-outline-variant shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-container-high"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReview}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90"
              >
                Review &amp; Konfirmasi →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: Confirm ───────────────────────────────────────────────── */}
        {step === "confirm" && (
          <>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {error && (
                <p className="text-sm text-error bg-error-container text-on-error-container px-3 py-2 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2 px-3 py-2.5 bg-primary-container/20 text-primary rounded-lg text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Pastikan semua data sudah benar sebelum memproses.
              </div>

              <div className="bg-surface border border-outline-variant rounded-xl divide-y divide-outline-variant">
                <div className="px-4 py-3 flex justify-between text-sm">
                  <span className="text-on-surface-variant">Invoice</span>
                  <span className="font-bold text-primary">{invoiceNumber}</span>
                </div>
                {totalWeightKg > 0 && (
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-on-surface-variant">Total Berat</span>
                    <span className="font-bold">{totalWeightKg} kg</span>
                  </div>
                )}
                {totalItemPcs && (
                  <div className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-on-surface-variant">Total Item</span>
                    <span className="font-bold">{totalItemPcs} pcs</span>
                  </div>
                )}

                {/* Kiloan items */}
                {kgSubtotals.filter((r) => r.qty > 0).length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Kiloan</p>
                    {kgSubtotals.filter((r) => r.qty > 0).map((r) => (
                      <div key={r.item.id} className="flex justify-between text-sm py-0.5">
                        <span>{r.item.name} <span className="text-on-surface-variant">× {r.qty} kg</span></span>
                        <span className="font-medium">{fmtPrice(r.sub)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pcs items */}
                {pcsSubtotals.filter((r) => r.qty > 0).length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Satuan</p>
                    {pcsSubtotals.filter((r) => r.qty > 0).map((r) => (
                      <div key={r.item.id} className="flex justify-between text-sm py-0.5">
                        <span>{r.item.name} <span className="text-on-surface-variant">× {r.qty} pcs</span></span>
                        <span className="font-medium">{fmtPrice(r.sub)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-4 py-3 flex justify-between text-sm">
                  <span className="text-on-surface-variant">Estimasi Total</span>
                  <span className="font-bold text-primary text-base">{fmtPrice(grandTotal)}</span>
                </div>

                {deskripsi && (
                  <div className="px-4 py-3 text-sm">
                    <span className="text-on-surface-variant">Deskripsi: </span>
                    <span className="italic">{deskripsi}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-on-surface-variant text-center">
                Setelah dikonfirmasi, order masuk ke antrian <strong>Washing Station</strong>.
              </p>
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-outline-variant shrink-0">
              <button
                type="button"
                onClick={() => { setStep("form"); setError(""); }}
                disabled={processOrder.isPending}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-container-high disabled:opacity-40"
              >
                ← Edit
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={processOrder.isPending}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {processOrder.isPending ? "Memproses..." : "✓ Konfirmasi & Proses"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
