"use client";

import { X, Flag, Loader2, ImageIcon, Shirt, Tag } from "lucide-react";
import { useBypassDetail } from "@/hooks/worker/useWorkerStation";

interface BypassViewModalProps {
  open: boolean;
  orderId: string;
  invoiceNumber: string;
  onClose: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export function BypassViewModal({ open, orderId, invoiceNumber, onClose }: BypassViewModalProps) {
  const { data: bypass, isLoading: loading } = useBypassDetail(orderId, open);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest w-full sm:max-w-[38rem] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-outline-variant flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-50 shrink-0">
              <Flag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-on-surface">Detail Bypass</h3>
              <p className="text-xs text-on-surface-variant truncate">
                Order <span className="font-semibold text-primary">#{invoiceNumber}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {bypass && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_BADGE[bypass.status] ?? "bg-surface-container text-on-surface-variant"}`}>
                {STATUS_LABEL[bypass.status] ?? bypass.status}
              </span>
            )}
            <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-on-surface-variant" />
            </div>
          ) : !bypass ? (
            <p className="text-sm text-on-surface-variant text-center py-10">
              Tidak ada data bypass untuk order ini.
            </p>
          ) : (
            <>
              {/* Discrepancy Tables — grouped by type */}
              {(() => {
                const breakdownItems = bypass.expected_items.filter((e) => e.item_type === "breakdown");
                const satuanItems = bypass.expected_items.filter((e) => e.item_type === "satuan");

                const renderTable = (
                  items: typeof bypass.expected_items,
                  type: "breakdown" | "satuan",
                ) => {
                  const isBreakdown = type === "breakdown";
                  return (
                    <div key={type}>
                      {/* Section header */}
                      <div className={`flex items-center gap-1.5 mb-2 px-1`}>
                        {isBreakdown
                          ? <Shirt className="w-3.5 h-3.5 text-amber-600" />
                          : <Tag className="w-3.5 h-3.5 text-blue-500" />
                        }
                        <span className={`text-xs font-bold uppercase tracking-wide ${isBreakdown ? "text-amber-700" : "text-blue-600"}`}>
                          {isBreakdown ? "Kiloan — Breakdown" : "Satuan"}
                        </span>
                        <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full ${isBreakdown ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-600"}`}>
                          {items.length} item
                        </span>
                      </div>

                      {/* Table */}
                      <div className={`rounded-xl overflow-hidden border ${isBreakdown ? "border-amber-200" : "border-blue-200"}`}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={`border-b ${isBreakdown ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                              <th className="text-left px-3 py-2 text-xs font-semibold text-on-surface-variant">Item</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Jumlah Kamu</th>
                              <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((exp) => {
                              const act = bypass.actual_items.find((a) => a.item_id === exp.item_id && a.item_type === exp.item_type);
                              const actualQty = act?.quantity ?? 0;
                              const isDiff = actualQty !== exp.quantity;
                              return (
                                <tr key={`${exp.item_type}:${exp.item_id}`} className={`border-b last:border-0 ${isBreakdown ? "border-amber-100 bg-amber-50/40" : "border-blue-100 bg-blue-50/40"}`}>
                                  <td className="px-3 py-2.5 font-medium text-on-surface">{exp.name}</td>
                                  <td className="px-3 py-2.5 text-center font-bold text-on-surface">{actualQty}</td>
                                  <td className="px-3 py-2.5 text-center">
                                    {isDiff ? (
                                      <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-error/10 text-error">
                                        Tidak Sesuai
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                        Sesuai
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                      Ketidaksesuaian Item
                    </p>
                    {breakdownItems.length > 0 && renderTable(breakdownItems, "breakdown")}
                    {satuanItems.length > 0 && renderTable(satuanItems, "satuan")}
                  </div>
                );
              })()}

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                  Deskripsi
                </p>
                <p className="text-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 whitespace-pre-wrap">
                  {bypass.discrepancy_description}
                </p>
              </div>

              {/* Photos */}
              {bypass.photo_evidence.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                    Foto Bukti
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {bypass.photo_evidence.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                        className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-white opacity-0 hover:opacity-100" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
