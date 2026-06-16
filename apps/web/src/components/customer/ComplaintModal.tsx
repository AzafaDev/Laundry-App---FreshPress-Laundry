"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Loader2, X } from "lucide-react";
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

const MAX_PHOTOS = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotoPreview {
  file: File;
  url: string;
}

export const ComplaintModal = ({ open, orderId, onClose }: ComplaintModalProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [complaintType, setComplaintType] = useState<ComplaintType>("missing_item");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [photoError, setPhotoError] = useState("");

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
      setPhotos([]);
      setPhotoError("");
    }
  }, [open]);

  // Revoke object URLs on unmount / photo removal to avoid memory leaks
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [photos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError("");
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const invalid = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalid) {
      setPhotoError("Format tidak didukung. Gunakan jpg, png, atau webp.");
      e.target.value = "";
      return;
    }

    const combined = [...photos, ...files];
    if (combined.length > MAX_PHOTOS) {
      setPhotoError(`Maksimal ${MAX_PHOTOS} foto.`);
      e.target.value = "";
      return;
    }

    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const mutation = useMutation({
    mutationFn: () => {
      if (!orderId) throw new Error("Order tidak ditemukan.");
      return orderService.createComplaint(
        orderId,
        { complaint_type: complaintType, description },
        photos.length > 0 ? photos.map((p) => p.file) : undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[10px]">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
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

        <div className="p-6 space-y-4 overflow-y-auto">
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

          {/* Photo upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-on-surface">
                Foto Bukti{" "}
                <span className="text-xs font-normal text-on-surface-variant">(opsional, maks. {MAX_PHOTOS})</span>
              </label>
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  Tambah foto
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map((p, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-xs">Tambah</span>
                  </button>
                )}
              </div>
            )}

            {photos.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-outline-variant py-4 flex flex-col items-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs font-medium">Klik untuk menambahkan foto</span>
                <span className="text-xs">jpg, png, webp • maks. 5 MB per foto</span>
              </button>
            )}

            {photoError && <p className="text-xs text-error">{photoError}</p>}
          </div>

          {mutation.isError && (
            <p className="text-xs text-error">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
                ?.message ??
                "Gagal mengirim komplain. Pastikan deskripsi minimal 10 karakter, lalu coba lagi."}
            </p>
          )}
        </div>

        <div className="p-6 bg-surface-container-low flex gap-4 shrink-0">
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
