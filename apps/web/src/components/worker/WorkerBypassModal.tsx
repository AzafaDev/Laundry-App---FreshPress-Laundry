"use client";

import { useState, useRef, useEffect } from "react";
import { X, Flag, Upload, Trash2, Loader2, AlertTriangle, ImagePlus, Shirt, Tag } from "lucide-react";
import { z } from "zod";
import { useWorkerStation } from "@/hooks/useWorkerStation";
import { useMultiFileValidation } from "@/hooks/useMultiFileValidation";
import toast from "react-hot-toast";
import type { Discrepancy } from "@/services/workerStation.service";

const bypassSchema = z.object({
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(255, "Deskripsi maksimal 255 karakter.")
    .regex(/\S/, "Deskripsi tidak boleh hanya spasi."),
});

interface WorkerBypassModalProps {
  open: boolean;
  orderId: string;
  invoiceNumber: string;
  discrepancies: Discrepancy[];
  actualItems: {
    breakdown: Array<{ clothing_type_id: string; actual_quantity: number }>;
    satuan: Array<{ laundry_item_id: string; actual_quantity: number }>;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function WorkerBypassModal({
  open,
  orderId,
  invoiceNumber,
  discrepancies,
  actualItems,
  onClose,
  onSuccess,
}: WorkerBypassModalProps) {
  const [description, setDescription] = useState("");
  const [descError, setDescError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createBypassRequest, isCreatingBypass: isSubmitting } = useWorkerStation();
  const { files: photos, addFiles, removeFile, reset: resetPhotos } = useMultiFileValidation({
    maxCount: 5,
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB — harus tetap sinkron manual dengan apps/api/src/config/constants.ts
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  useEffect(() => {
    if (!open) {
      setDescription("");
      setDescError("");
      resetPhotos();
    }
  }, [open, resetPhotos]);

  if (!open) return null;

  const handleSubmit = async () => {
    const result = bypassSchema.safeParse({ description: description.trim() });
    if (!result.success) {
      setDescError(result.error.issues[0].message);
      return;
    }
    setDescError("");

    try {
      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("discrepancy_description", description.trim());
      formData.append("actual_items", JSON.stringify(actualItems.breakdown));
      formData.append("actual_satuan_items", JSON.stringify(actualItems.satuan));
      photos.forEach((p) => formData.append("photo_evidence", p.file));

      await createBypassRequest(formData);
      toast.success("Bypass request berhasil dikirim");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Gagal mengirim bypass request");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest w-full sm:max-w-[38rem] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-outline-variant flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0 bg-error/5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-error/10">
              <Flag className="w-4 h-4 text-error" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Ajukan Bypass</h3>
              <p className="text-xs text-on-surface-variant">
                Order <span className="font-semibold text-primary">#{invoiceNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5 will-change-scroll">

          {/* Diff Tables — grouped by type */}
          {(() => {
            const breakdownDisc = discrepancies.filter((d) => d.item_type === "breakdown");
            const satuanDisc = discrepancies.filter((d) => d.item_type === "satuan");

            const renderGroup = (items: typeof discrepancies, type: "breakdown" | "satuan") => {
              const isBreakdown = type === "breakdown";
              return (
                <div key={type}>
                  <div className="flex items-center gap-1.5 mb-2 px-1">
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

                  <div className={`rounded-xl overflow-hidden border ${isBreakdown ? "border-amber-200" : "border-blue-200"}`}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${isBreakdown ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-on-surface-variant">Item</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Jumlah Kamu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((d) => (
                          <tr key={`${d.item_type}:${d.item_id}`} className={`border-b last:border-0 ${isBreakdown ? "border-amber-100 bg-amber-50/40" : "border-blue-100 bg-blue-50/40"}`}>
                            <td className="px-3 py-2.5 font-medium text-on-surface">{d.name}</td>
                            <td className="px-3 py-2.5 text-center font-bold text-on-surface">{d.actual}</td>
                          </tr>
                        ))}
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
                {breakdownDisc.length > 0 && renderGroup(breakdownDisc, "breakdown")}
                {satuanDisc.length > 0 && renderGroup(satuanDisc, "satuan")}
              </div>
            );
          })()}

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2 block">
              Deskripsi Ketidaksesuaian <span className="text-error">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); if (descError) setDescError(""); }}
              placeholder="Jelaskan alasan ketidaksesuaian item secara detail..."
              rows={4}
              maxLength={255}
              className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-surface resize-none focus:outline-none focus:ring-2 transition-colors ${
                descError
                  ? "border-error/50 focus:ring-error/30"
                  : "border-outline-variant focus:ring-primary/30"
              }`}
            />
            {descError && (
              <p className="text-xs text-error mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {descError}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2 block">
              Foto Bukti <span className="text-error">*</span>
              <span className="normal-case font-normal ml-1 text-on-surface-variant">(opsional)</span>
            </label>

            {/* Drop zone / trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed transition-colors border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary/40"
            >
              <div className="p-2 rounded-lg bg-surface-container">
                <ImagePlus className="w-5 h-5 text-on-surface-variant" />
              </div>
              <p className="text-sm text-on-surface-variant">
                <span className="font-semibold text-primary">Pilih foto</span> atau tap di sini
              </p>
              <p className="text-xs text-on-surface-variant">JPG, PNG, WEBP — maks. 5 foto</p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />


            {/* Preview grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={`Bukti ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center gap-1 text-on-surface-variant transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">Tambah</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-error text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
            ) : (
              <><Flag className="w-4 h-4" /> Ajukan Bypass</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
