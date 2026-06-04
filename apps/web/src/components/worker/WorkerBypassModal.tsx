"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Flag, Upload, Trash2, Loader2, AlertTriangle, ImagePlus, ArrowDown, ArrowUp } from "lucide-react";
import { workerStationService } from "@/services/workerStation.service";
import toast from "react-hot-toast";
import type { Discrepancy } from "@/services/workerStation.service";

interface WorkerBypassModalProps {
  open: boolean;
  orderId: string;
  invoiceNumber: string;
  discrepancies: Discrepancy[];
  actualItems: Array<{ clothing_type_id: string; actual_quantity: number }>;
  onClose: () => void;
  onSuccess: () => void;
}

interface PhotoPreview {
  file: File;
  url: string;
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
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descError, setDescError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revokeAll = useCallback((list: PhotoPreview[]) => {
    list.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  useEffect(() => {
    if (!open) {
      setDescription("");
      setDescError("");
      setPhotoError("");
      setIsSubmitting(false);
      setPhotos((prev) => { revokeAll(prev); return []; });
    }
  }, [open, revokeAll]);

  useEffect(() => {
    return () => {
      setPhotos((prev) => { revokeAll(prev); return prev; });
    };
  }, [revokeAll]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newPreviews: PhotoPreview[] = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPreviews]);
    setPhotoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    let valid = true;

    if (description.trim().length < 10) {
      setDescError("Deskripsi minimal 10 karakter.");
      valid = false;
    } else {
      setDescError("");
    }

    if (photos.length === 0) {
      setPhotoError("Minimal 1 foto bukti wajib dilampirkan.");
      valid = false;
    } else {
      setPhotoError("");
    }

    if (!valid) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("discrepancy_description", description.trim());
      formData.append("actual_items", JSON.stringify(actualItems));
      photos.forEach((p) => formData.append("photo_evidence", p.file));

      await workerStationService.createBypassRequest(formData);
      toast.success("Bypass request berhasil dikirim");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message ?? "Gagal mengirim bypass request");
    } finally {
      setIsSubmitting(false);
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

          {/* Diff Table */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2.5">
              Ketidaksesuaian Item
            </p>
            <div className="rounded-xl border border-outline-variant overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-on-surface-variant">Item</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Ekspektasi</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Aktual</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-on-surface-variant">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancies.map((d) => {
                    const diff = d.actual - d.expected;
                    const isShort = diff < 0;
                    return (
                      <tr key={d.clothing_type_id} className="border-b border-outline-variant last:border-0 bg-amber-50/60">
                        <td className="px-3 py-2.5 font-medium text-on-surface">{d.name}</td>
                        <td className="px-3 py-2.5 text-center text-on-surface-variant">{d.expected}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-error">{d.actual}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                            isShort ? "bg-error/10 text-error" : "bg-amber-100 text-amber-700"
                          }`}>
                            {isShort ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                            {Math.abs(diff)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

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
              <span className="normal-case font-normal ml-1 text-on-surface-variant">(min. 1 foto)</span>
            </label>

            {/* Drop zone / trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed transition-colors ${
                photoError
                  ? "border-error/40 bg-error/5"
                  : "border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary/40"
              }`}
            >
              <div className="p-2 rounded-lg bg-surface-container">
                <ImagePlus className={`w-5 h-5 ${photoError ? "text-error" : "text-on-surface-variant"}`} />
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
              onChange={handleFileChange}
            />

            {photoError && (
              <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {photoError}
              </p>
            )}

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
                      onClick={() => removePhoto(idx)}
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
