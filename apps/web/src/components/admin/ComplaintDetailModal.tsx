"use client";

import { useState } from "react";
import {
  X,
  MessageSquareWarning,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Image,
  ChevronRight,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import type { Complaint } from "@/types/order.types";

interface Props {
  complaint: Complaint;
  onClose: () => void;
}

const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  missing_item: "Item Hilang",
  damaged_item: "Item Rusak",
  wrong_item: "Item Tertukar",
  late_delivery: "Pengantaran Terlambat",
  quality_issue: "Kualitas Kurang Baik",
  other: "Lainnya",
};

function StatusBadge({ status }: { status: Complaint["status"] }) {
  const cfg: Record<Complaint["status"], { cls: string; label: string }> = {
    open: { cls: "bg-amber-100 text-amber-700", label: "Open" },
    in_progress: { cls: "bg-blue-100 text-blue-700", label: "Dalam Proses" },
    resolved: { cls: "bg-emerald-100 text-emerald-700", label: "Selesai" },
    rejected: { cls: "bg-red-100 text-red-700", label: "Ditolak" },
  };
  const { cls, label } = cfg[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtTime(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Timeline ──────────────────────────────────────────────────────────────────
function Timeline({ complaint }: { complaint: Complaint }) {
  type Step = { label: string; date: string | null; done: boolean; active?: boolean };
  const steps: Step[] = [];

  steps.push({ label: "Komplain Masuk", date: complaint.created_at, done: true });

  if (complaint.status === "rejected") {
    steps.push({
      label: "Komplain Ditolak",
      date: complaint.resolved_at,
      done: true,
      active: true,
    });
  } else {
    steps.push({
      label: "Dalam Proses",
      date: complaint.status !== "open" ? complaint.updated_at : null,
      done: complaint.status !== "open",
      active: complaint.status === "in_progress",
    });
    steps.push({
      label: "Diselesaikan",
      date: complaint.resolved_at,
      done: complaint.status === "resolved",
      active: complaint.status === "resolved",
    });
  }

  return (
    <div className="relative">
      {steps.map((step, idx) => (
        <div key={idx} className="flex gap-3 relative">
          {/* line */}
          {idx < steps.length - 1 && (
            <div className="absolute left-3.5 top-7 bottom-0 w-px bg-outline-variant" />
          )}
          {/* dot */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              step.done ? "bg-primary text-on-primary" : "bg-surface-container border-2 border-outline-variant text-on-surface-variant"
            }`}
          >
            {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
          </div>
          {/* content */}
          <div className="pb-5">
            <p className={`text-sm font-semibold ${step.done ? "text-on-surface" : "text-on-surface-variant"}`}>
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-on-surface-variant mt-0.5">{fmtTime(step.date)}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function ComplaintDetailModal({ complaint, onClose }: Props) {
  const queryClient = useQueryClient();
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolution_notes ?? "");
  const [expectedDate, setExpectedDate] = useState(
    complaint.expected_resolution_date
      ? complaint.expected_resolution_date.split("T")[0]
      : "",
  );

  const isActionable = complaint.status === "open" || complaint.status === "in_progress";

  const mutation = useMutation({
    mutationFn: async (payload: {
      status: "in_progress" | "resolved" | "rejected";
      resolution_notes?: string;
      expected_resolution_date?: string;
    }) => {
      const { data } = await axiosInstance.patch(
        `/v1/admin/complaints/${complaint.id}/status`,
        payload,
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      const labels: Record<string, string> = {
        in_progress: "Komplain sedang ditangani",
        resolved: "Komplain berhasil diselesaikan",
        rejected: "Komplain ditolak",
      };
      toast.success(labels[vars.status] ?? "Status diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin", "complaints"] });
      onClose();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? "Gagal memperbarui status");
    },
  });

  function handleAction(status: "in_progress" | "resolved" | "rejected") {
    mutation.mutate({
      status,
      resolution_notes: resolutionNotes || undefined,
      expected_resolution_date: expectedDate || undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest w-full sm:max-w-[42rem] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-outline-variant flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageSquareWarning className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Detail Komplain</h3>
              <p className="text-xs text-on-surface-variant">
                Invoice <span className="font-semibold text-primary">#{complaint.order.invoice_number}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Customer</p>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                <p className="font-semibold text-on-surface">{complaint.customer.full_name}</p>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 ml-5">{complaint.customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Status</p>
              <StatusBadge status={complaint.status} />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Tipe Komplain</p>
              <p className="font-semibold text-on-surface">
                {COMPLAINT_TYPE_LABELS[complaint.complaint_type] ?? complaint.complaint_type}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">Tanggal Masuk</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                <p className="font-semibold text-on-surface">{fmt(complaint.created_at)}</p>
              </div>
            </div>
            {complaint.outlet && (
              <div className="col-span-2">
                <p className="text-xs text-on-surface-variant mb-0.5">Outlet</p>
                <p className="font-semibold text-on-surface">{complaint.order.outlet?.name ?? "—"}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
              Deskripsi Komplain
            </p>
            <p className="text-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5 whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Photo evidence */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" />
              Foto Bukti
            </p>
            {complaint.photo_urls && complaint.photo_urls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {complaint.photo_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant block group"
                  >
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
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

          {/* Timeline — read-only states */}
          {(complaint.status === "resolved" || complaint.status === "rejected") && (
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
                Timeline
              </p>
              <Timeline complaint={complaint} />
              {complaint.resolution_notes && (
                <div className="mt-2 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2.5">
                  <p className="text-xs text-on-surface-variant mb-1">
                    {complaint.status === "resolved" ? "Catatan Resolusi" : "Alasan Penolakan"}
                  </p>
                  <p className="text-sm text-on-surface">{complaint.resolution_notes}</p>
                </div>
              )}
              {complaint.resolver && (
                <p className="text-xs text-on-surface-variant mt-2">
                  Ditangani oleh: <span className="font-semibold">{complaint.resolver.full_name}</span>
                </p>
              )}
            </div>
          )}

          {/* Action form — actionable states */}
          {isActionable && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                {complaint.status === "open" ? "Tangani Komplain" : "Update Penanganan"}
              </p>

              {/* Expected resolution date — shown when handling */}
              {complaint.status === "open" && (
                <div>
                  <label className="text-xs font-medium text-on-surface-variant block mb-1">
                    Target Penyelesaian <span className="font-normal">(opsional)</span>
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-on-surface-variant block mb-1">
                  {complaint.status === "in_progress" ? "Catatan Resolusi" : "Catatan"}{" "}
                  <span className="font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    complaint.status === "in_progress"
                      ? "Tuliskan ringkasan penyelesaian atau alasan penolakan..."
                      : "Tambahkan catatan penanganan..."
                  }
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-none"
                />
              </div>

              {complaint.expected_resolution_date && complaint.status === "in_progress" && (
                <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Target selesai: <span className="font-semibold text-blue-700">{fmt(complaint.expected_resolution_date)}</span></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant shrink-0">
          {isActionable ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleAction("rejected")}
                disabled={mutation.isPending}
                className="flex-1 py-2.5 border-2 border-error text-error rounded-xl text-sm font-semibold hover:bg-error/5 disabled:opacity-50 transition-colors"
              >
                Tolak
              </button>
              {complaint.status === "open" ? (
                <button
                  onClick={() => handleAction("in_progress")}
                  disabled={mutation.isPending}
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-primary/20"
                >
                  {mutation.isPending ? "Memproses..." : "Tangani →"}
                </button>
              ) : (
                <button
                  onClick={() => handleAction("resolved")}
                  disabled={mutation.isPending}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-emerald-600/20"
                >
                  {mutation.isPending ? "Memproses..." : "Selesaikan ✓"}
                </button>
              )}
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
