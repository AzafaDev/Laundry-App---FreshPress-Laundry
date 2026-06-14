"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, type ComplaintType } from "@/services/order.service";

interface ComplaintModalProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
}

const COMPLAINT_TYPE_OPTIONS: { value: ComplaintType; label: string }[] = [
  { value: "missing_item", label: "Item hilang" },
  { value: "damaged_item", label: "Item rusak" },
  { value: "wrong_item", label: "Item tertukar" },
  { value: "late_delivery", label: "Pengantaran terlambat" },
  { value: "quality_issue", label: "Kualitas cuci kurang baik" },
  { value: "other", label: "Lainnya" },
];

export const ComplaintModal = ({ open, orderId, onClose }: ComplaintModalProps) => {
  const queryClient = useQueryClient();
  const [complaintType, setComplaintType] = useState<ComplaintType>("missing_item");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setComplaintType("missing_item");
      setDescription("");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!orderId) throw new Error("Order tidak ditemukan.");
      return orderService.createComplaint(orderId, {
        complaint_type: complaintType,
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[10px]">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            Ajukan Komplain
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface">Jenis Komplain</label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value as ComplaintType)}
              className="w-full bg-white border border-outline-variant rounded-lg p-3 text-sm focus:border-primary"
            >
              {COMPLAINT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg p-3 text-sm h-28 focus:border-primary"
              placeholder="Jelaskan kendala yang kamu alami (minimal 10 karakter)..."
            />
          </div>

          {mutation.isError && (
            <p className="text-xs text-error">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
                ?.message ??
                "Gagal mengirim komplain. Pastikan deskripsi minimal 10 karakter, lalu coba lagi."}
            </p>
          )}
        </div>

        <div className="p-6 bg-surface-container-low flex gap-4">
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || description.trim().length < 10}
            className="flex-1 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirim Komplain
          </button>
        </div>
      </div>
    </div>
  );
};
