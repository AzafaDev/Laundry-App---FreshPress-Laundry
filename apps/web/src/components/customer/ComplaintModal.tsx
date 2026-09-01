"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, type ComplaintType } from "@/services/order.service";
import { PhotoUploadSection, type PhotoPreview } from "./complaint/PhotoUploadSection";
import { useTranslation } from "@/i18n/useTranslation";

interface ComplaintModalProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
}

const COMPLAINT_TYPE_KEYS: { value: ComplaintType; key: string }[] = [
  { value: "missing_item", key: "typeMissing" },
  { value: "damaged_item", key: "typeDamaged" },
  { value: "wrong_item", key: "typeWrong" },
  { value: "late_delivery", key: "typeLate" },
  { value: "quality_issue", key: "typeQuality" },
  { value: "other", key: "typeOther" },
];

export const ComplaintModal = ({ open, orderId, onClose }: ComplaintModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [complaintType, setComplaintType] = useState<ComplaintType>("missing_item");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) { document.addEventListener("keydown", handleEscape); document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.removeEventListener("keydown", handleEscape); document.body.style.overflow = ""; };
  }, [open, onClose]);

  useEffect(() => {
    if (open) { setComplaintType("missing_item"); setDescription(""); setPhotos([]); setPhotoError(""); }
  }, [open]);

  useEffect(() => {
    return () => { photos.forEach((p) => URL.revokeObjectURL(p.url)); };
  }, [photos]);

  const handleAddPhotos = (files: File[]) => {
    const newPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newPreviews]);
    setPhotoError("");
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const mutation = useMutation({
    mutationFn: () => {
      if (!orderId) throw new Error(t("complaint.orderNotFound"));
      return orderService.createComplaint(orderId, { complaint_type: complaintType, description }, photos.length > 0 ? photos.map((p) => p.file) : undefined);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customer", "orders"] }); onClose(); },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[10px]">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />{t("complaint.modalTitle")}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface">{t("complaint.typeLabel")}</label>
            <select value={complaintType} onChange={(e) => setComplaintType(e.target.value as ComplaintType)} className="w-full bg-white border border-outline-variant rounded-lg p-3 text-sm focus:border-primary">
              {COMPLAINT_TYPE_KEYS.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(`complaint.${opt.key}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface">{t("complaint.descriptionLabel")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white border border-outline-variant rounded-lg p-3 text-sm h-28 focus:border-primary" placeholder={t("complaint.descriptionPlaceholder")} />
          </div>

          <PhotoUploadSection photos={photos} photoError={photoError} onAddPhotos={handleAddPhotos} onRemovePhoto={handleRemovePhoto} onError={setPhotoError} />

          {mutation.isError && (
            <p className="text-xs text-error">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t("complaint.submitError")}
            </p>
          )}
        </div>

        <div className="p-6 bg-surface-container-low flex gap-4 shrink-0">
          <button onClick={onClose} disabled={mutation.isPending} className="flex-1 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg disabled:opacity-50">{t("complaint.cancel")}</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || description.trim().length < 10} className="flex-1 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}{t("complaint.submit")}
          </button>
        </div>
      </div>
    </div>
  );
};
