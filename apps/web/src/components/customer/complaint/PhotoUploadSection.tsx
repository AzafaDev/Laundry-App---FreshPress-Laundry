"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

const MAX_PHOTOS = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface PhotoPreview {
  file: File;
  url: string;
}

interface Props {
  photos: PhotoPreview[];
  photoError: string;
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (index: number) => void;
  onError: (msg: string) => void;
}

export function PhotoUploadSection({ photos, photoError, onAddPhotos, onRemovePhoto, onError }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const invalid = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalid) { onError("Format tidak didukung. Gunakan jpg, png, atau webp."); return; }
    if (photos.length + files.length > MAX_PHOTOS) { onError(`Maksimal ${MAX_PHOTOS} foto.`); return; }
    onAddPhotos(files);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-on-surface">
          Foto Bukti <span className="text-xs font-normal text-on-surface-variant">(opsional, maks. {MAX_PHOTOS})</span>
        </label>
        {photos.length < MAX_PHOTOS && (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <ImagePlus className="w-3.5 h-3.5" />Tambah foto
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileChange} />

      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`foto ${idx + 1}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => onRemovePhoto(idx)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
              <ImagePlus className="w-5 h-5" /><span className="text-xs">Tambah</span>
            </button>
          )}
        </div>
      )}

      {photos.length === 0 && (
        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-outline-variant py-4 flex flex-col items-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
          <ImagePlus className="w-6 h-6" />
          <span className="text-xs font-medium">Klik untuk menambahkan foto</span>
          <span className="text-xs">jpg, png, webp • maks. 5 MB per foto</span>
        </button>
      )}

      {photoError && <p className="text-xs text-error">{photoError}</p>}
    </div>
  );
}
