"use client";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, X, Shirt,
} from "lucide-react";
import { z } from "zod";
import {
  useQuery, useMutation, useQueryClient, keepPreviousData,
} from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

const clothingTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi.")
    .max(100, "Nama maksimal 100 karakter.")
    .trim(),
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClothingType {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const KEY = ["admin", "clothing-types"] as const;

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchList = async (page: number, search: string) => {
  const params = new URLSearchParams({ page: String(page), limit: "15", sort_dir: "asc" });
  if (search) params.set("search", search);
  const { data } = await axiosInstance.get(`/v1/admin/clothing-types?${params}`);
  return data;
};

// ── Form Modal ────────────────────────────────────────────────────────────────
function FormModal({
  initial,
  onClose,
}: {
  initial: ClothingType | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const { data } = await axiosInstance.patch(`/v1/admin/clothing-types/${initial!.id}`, { name, is_active: isActive });
        return data;
      }
      const { data } = await axiosInstance.post("/v1/admin/clothing-types", { name, is_active: isActive });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(isEdit ? "Jenis pakaian diperbarui." : "Jenis pakaian ditambahkan.");
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Terjadi kesalahan.";
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = clothingTypeSchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h3 className="font-bold text-lg">{isEdit ? "Edit Jenis Pakaian" : "Tambah Jenis Pakaian"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-error bg-error-container text-on-error-container px-3 py-2 rounded-lg">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Nama Jenis Pakaian *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Kaos, Celana Panjang"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            Aktif
          </label>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-high">
              Batal
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {mutation.isPending ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ClothingTypesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ClothingType | null>(null);

  const { data, isFetching, isError } = useQuery({
    queryKey: [...KEY, page, search],
    queryFn: () => fetchList(page, search),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/v1/admin/clothing-types/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success("Jenis pakaian dihapus.");
    },
    onError: () => toast.error("Gagal menghapus."),
  });

  const items: ClothingType[] = data?.data ?? [];
  const pagination = data?.pagination;

  const handleDelete = (item: ClothingType) => {
    if (!confirm(`Hapus jenis pakaian "${item.name}"?`)) return;
    deleteMutation.mutate(item.id);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Jenis Pakaian</h2>
        <p className="text-base text-on-surface-variant">
          Master data jenis pakaian untuk rincian order kiloan.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari jenis pakaian..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Tambah Jenis Pakaian
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {isError && (
          <p className="p-4 text-sm text-error">Gagal memuat data. Coba lagi.</p>
        )}
        <div className="overflow-x-auto">
          <table className={`w-full text-sm border-collapse ${isFetching ? "opacity-60" : ""}`}>
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nama Jenis Pakaian</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {items.length === 0 && !isFetching ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-on-surface-variant">
                    <Shirt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Belum ada jenis pakaian.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        item.is_active
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}>
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditing(item); setModal("edit"); }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 hover:bg-error-container rounded-lg text-error disabled:opacity-40"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-surface-container-low p-4 flex items-center justify-between border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              {pagination.total} jenis pakaian
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || isFetching}
                className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages || isFetching}
                className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <FormModal
          initial={modal === "edit" ? editing : null}
          onClose={() => { setModal(null); setEditing(null); }}
        />
      )}
    </>
  );
}
