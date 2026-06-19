"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  AlertTriangle,
  Upload,
  X,
  Send,
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";

const complaintTypes = [
  { value: "lost", label: "Barang Hilang" },
  { value: "damaged", label: "Barang Rusak" },
  { value: "mismatch", label: "Tidak Sesuai Pesanan" },
  { value: "other", label: "Lainnya" },
];

const complaintSchema = z.object({
  type: z.enum(["lost", "damaged", "mismatch", "other"] as const, {
    message: "Pilih jenis masalah terlebih dahulu.",
  }),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(1000, "Deskripsi maksimal 1000 karakter."),
});

export default function ComplainPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(selected.type)) {
      setFileError("Format file harus JPG, PNG, atau GIF.");
      return;
    }

    if (selected.size > 1 * 1024 * 1024) {
      setFileError("Ukuran file maksimal 1MB.");
      return;
    }

    setFileError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setFileError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const result = complaintSchema.safeParse({ type: type || undefined, description });
    if (!result.success) {
      setFormError(result.error.issues[0].message);
      return;
    }

    // TODO: API call
    console.log("Complaint submitted:", { orderId, type, description, file });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-5xl">📩</div>
          <h2 className="text-xl font-bold text-on-surface">
            Komplain Terkirim
          </h2>
          <p className="text-on-surface-variant text-sm">
            Tim kami akan meninjau komplain Anda dan menghubungi dalam 1x24
            jam.
          </p>
          <Link
            href={`/dashboard/orders/detail`}
            className="inline-block mt-4 bg-primary text-white py-3 px-8 rounded-2xl font-bold hover:opacity-90 transition-all"
          >
            Kembali ke Detail Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-50 w-full px-4 h-16 bg-surface border-b border-outline-variant flex items-center gap-2">
        <Link
          href="/dashboard/orders/detail"
          className="p-1 hover:bg-surface-container-low rounded-lg transition-colors"
          aria-label="Kembali ke detail order"
        >
          <ChevronLeft className="w-6 h-6 text-on-surface-variant" />
        </Link>
        <h1 className="text-xl font-bold text-on-surface">Buat Komplain</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <p className="text-sm text-on-surface-variant mb-4">
            Order: <strong className="text-on-surface">{orderId}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="text-sm text-error bg-error-container/30 px-3 py-2 rounded-xl" role="alert">
                {formError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
                Jenis Masalah
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base"
              >
                <option value="">Pilih jenis masalah...</option>
                {complaintTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="description"
                className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5"
              >
                Deskripsi
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Jelaskan masalah yang Anda alami..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
                Upload Foto{" "}
                <span className="text-on-surface-variant font-normal">
                  (opsional, max 1MB)
                </span>
              </label>
              {preview ? (
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border border-outline-variant"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 bg-error text-white rounded-full p-0.5 shadow"
                    aria-label="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  <Upload className="w-5 h-5 text-outline" />
                  <span className="text-sm text-on-surface-variant">
                    Pilih file (JPG, PNG, GIF)
                  </span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
              {fileError && (
                <p className="text-xs text-error mt-1" role="alert">
                  {fileError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-primary text-on-primary py-4 rounded-2xl font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5" />
              Kirim Komplain
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
