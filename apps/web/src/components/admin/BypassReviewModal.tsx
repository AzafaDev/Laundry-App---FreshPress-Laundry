"use client";

import { useState } from "react";
import { X, Flag, AlertTriangle, CheckCircle2, XCircle, Image } from "lucide-react";

interface BypassItem {
  item_type: string;
  item_id: string;
  name: string;
  quantity: number;
}

interface BypassRequest {
  id: string;
  orderId: string;
  worker: string;
  station: string;
  expected_items: BypassItem[];
  actual_items: BypassItem[];
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string | null;
  photo_evidence?: string[];
}

interface BypassReviewModalProps {
  request: BypassRequest;
  onClose: () => void;
  onApprove: (pin: string, adminNote: string) => void;
  onReject: (pin: string, adminNote: string) => void;
}

export function BypassReviewModal({
  request,
  onClose,
  onApprove,
  onReject,
}: BypassReviewModalProps) {
  const [adminNote, setAdminNote] = useState(request.admin_notes ?? "");

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest w-full sm:max-w-[38rem] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-outline-variant flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0 bg-error/5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-error/10">
              <Flag className="w-4 h-4 text-error" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Review Bypass</h3>
              <p className="text-xs text-on-surface-variant">
                Invoice <span className="font-semibold text-primary">#{request.orderId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Worker</p>
              <p className="font-semibold text-on-surface">{request.worker}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Station</p>
              <p className="font-semibold text-on-surface">{request.station}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-on-surface-variant mb-0.5">Status</p>
              <div>
                {request.status === "pending" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                    Pending
                  </span>
                )}
                {request.status === "approved" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                )}
                {request.status === "rejected" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">
                    <XCircle className="w-3 h-3" /> Rejected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Per-item discrepancy table */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-error" />
              Ketidaksesuaian Item
            </p>
            <div className="rounded-xl border border-outline-variant overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-on-surface-variant">Item</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Expected</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Actual</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {request.expected_items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-xs text-on-surface-variant">
                        Tidak ada data item
                      </td>
                    </tr>
                  ) : (
                    request.expected_items.map((exp) => {
                      const actItem = request.actual_items.find((a) => a.item_id === exp.item_id);
                      // actual = expected - selisih
                      const selisih = exp.quantity - (actItem?.quantity ?? 0);
                      const actual = exp.quantity - selisih;
                      return (
                        <tr
                          key={`${exp.item_type}:${exp.item_id}`}
                          className="border-b border-outline-variant last:border-0 bg-amber-50/60"
                        >
                          <td className="px-3 py-2.5 font-medium text-on-surface">{exp.name}</td>
                          <td className="px-3 py-2.5 text-center text-on-surface-variant">{exp.quantity}</td>
                          <td className="px-3 py-2.5 text-center font-bold text-on-surface">{actual}</td>
                          <td className="px-3 py-2.5 text-center">
                            {selisih !== 0 ? (
                              <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-error/10 text-error">
                                {selisih > 0 ? `-${selisih}` : `+${Math.abs(selisih)}`}
                              </span>
                            ) : (
                              <span className="text-xs text-on-surface-variant">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Worker reason */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
              Deskripsi Worker
            </p>
            <p className="text-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 whitespace-pre-wrap">
              {request.reason}
            </p>
          </div>

          {/* Photo evidence */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" />
              Foto Bukti
            </p>
            {request.photo_evidence && request.photo_evidence.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {request.photo_evidence.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant block group"
                  >
                    <img
                      src={url}
                      alt={`Bukti ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Lihat</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-3 bg-surface-container-low border border-outline-variant rounded-xl">
                <Image className="w-4 h-4 text-on-surface-variant shrink-0" />
                <p className="text-xs text-on-surface-variant">Tidak ada foto bukti</p>
              </div>
            )}
          </div>

          {/* Admin note — editable if pending, read-only otherwise */}
          {request.status === "pending" ? (
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2 block">
                Catatan Admin <span className="normal-case font-normal">(opsional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tambahkan catatan untuk worker..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors text-sm resize-none"
              />
            </div>
          ) : request.admin_notes ? (
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
                Catatan Admin
              </p>
              <p className="text-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5">
                {request.admin_notes}
              </p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant shrink-0">
          {request.status === "pending" ? (
            <div className="flex gap-3">
              <button
                onClick={() => onReject("", adminNote)}
                className="flex-1 py-2.5 border-2 border-error text-error rounded-xl text-sm font-semibold hover:bg-error/5 transition-colors"
              >
                Tolak
              </button>
              <button
                onClick={() => onApprove("", adminNote)}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Setujui
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
