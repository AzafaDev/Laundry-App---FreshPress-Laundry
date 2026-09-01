"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, Scale, Package, ShieldAlert } from "lucide-react";
import { z } from "zod";
import {
  useLaundryItems,
  useCreateLaundryItem,
  useUpdateLaundryItem,
  useDeleteLaundryItem,
  useHardDeleteLaundryItem,
} from "@/hooks/useLaundryItems";
import type { LaundryItem, CreateLaundryItemPayload } from "@/types/laundryItem.types";

const laundryItemSchema = z.object({
  name: z.string().min(1, "Nama item wajib diisi.").max(100, "Nama maksimal 100 karakter."),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter.").optional(),
  unit: z.string().min(1, "Satuan wajib diisi."),
  base_price: z.number({ message: "Harga harus berupa angka." }).positive("Harga harus lebih dari 0."),
});

const fmtPrice = (v: string | number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v));

// Units counted as weight-based (priced per kilo). Anything else is per-pcs.
const KILO_UNITS = ["kg", "kilo", "kilos", "kilogram", "kilograms"];

const isKiloUnit = (unit: string) => KILO_UNITS.includes(unit.trim().toLowerCase());

type SortCol = "name" | "base_price";
type SortDir = "asc" | "desc";

interface FormModalProps {
  initial?: LaundryItem | null;
  onClose: () => void;
}

function LaundryItemFormModal({ initial, onClose }: FormModalProps) {
  const create = useCreateLaundryItem();
  const update = useUpdateLaundryItem();
  const isEdit = !!initial;

  const [form, setForm] = useState<CreateLaundryItemPayload>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    unit: initial?.unit ?? "pcs",
    base_price: Number(initial?.base_price ?? 0),
    is_active: initial?.is_active ?? true,
  });
  const [error, setError] = useState("");

  const set = (k: keyof CreateLaundryItemPayload, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = laundryItemSchema.safeParse({
      name: form.name.trim(),
      description: form.description || undefined,
      unit: form.unit,
      base_price: form.base_price,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      if (isEdit) {
        await update.mutateAsync({ id: initial!.id, payload: form });
      } else {
        await create.mutateAsync(form);
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Terjadi kesalahan.");
    }
  };

  const busy = create.isPending || update.isPending;
  const grouping = isKiloUnit(form.unit ?? "") ? "Per Kilo" : "Per Pcs";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h3 className="font-bold text-lg">{isEdit ? "Edit Item" : "Tambah Item"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container-high">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-error bg-error-container text-on-error-container px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Nama Item *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
              placeholder="cth. Kaos, Celana Panjang"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface resize-none"
              placeholder="Opsional"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Satuan</label>
              <select
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
              </select>
              <p className="mt-1 text-xs text-on-surface-variant">
                Gunakan <span className="font-medium">pcs</span> untuk laundry item. Gunakan{" "}
                <span className="font-medium">kg</span> untuk item per kilo.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Harga Dasar (Rp) *</label>
              <input
                type="number"
                min={0}
                value={form.base_price || ""}
                onChange={(e) => set("base_price", Number(e.target.value))}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="is_active" className="text-sm">Aktif</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-high"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ItemsSectionProps {
  title: string;
  icon: React.ReactNode;
  items: LaundryItem[];
  isFetching: boolean;
  sortBy: SortCol;
  sortDir: SortDir;
  onToggleSort: (col: SortCol) => void;
  onEdit: (item: LaundryItem) => void;
  onDelete: (item: LaundryItem) => void;
  onHardDelete: (item: LaundryItem) => void;
}

function ItemsSection({
  title, icon, items, isFetching, sortBy, sortDir, onToggleSort, onEdit, onDelete, onHardDelete,
}: ItemsSectionProps) {
  const SortIcon = ({ col }: { col: SortCol }) =>
    sortBy === col ? (
      <span className="ml-1 text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-on-surface-variant">({items.length})</span>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th
                  className="px-4 py-2.5 text-xs font-semibold cursor-pointer select-none"
                  onClick={() => onToggleSort("name")}
                >
                  Nama Item <SortIcon col="name" />
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold">Deskripsi</th>
                <th className="px-4 py-2.5 text-xs font-semibold">Satuan</th>
                <th
                  className="px-4 py-2.5 text-xs font-semibold cursor-pointer select-none"
                  onClick={() => onToggleSort("base_price")}
                >
                  Harga Dasar <SortIcon col="base_price" />
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-outline-variant ${isFetching ? "opacity-60" : ""}`}>
              {items.length === 0 && !isFetching ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-on-surface-variant">
                    Belum ada item pada grup ini.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isDeleted = !!item.deleted_at;
                  return (
                    <tr key={item.id} className={`transition-colors ${isDeleted ? "bg-error-container/10 opacity-60" : "hover:bg-surface-container-lowest"}`}>
                      <td className="px-4 py-2.5 font-medium text-sm">
                        <span className={isDeleted ? "line-through text-on-surface-variant" : ""}>{item.name}</span>
                        {isDeleted && <span className="ml-2 text-xs text-error font-normal">(terhapus)</span>}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-on-surface-variant max-w-xs truncate">
                        {item.description ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-sm">{item.unit}</td>
                      <td className="px-4 py-2.5 text-sm font-medium">{fmtPrice(item.base_price)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isDeleted && (
                            <>
                              <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant" title="Edit">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => onDelete(item)} className="p-1.5 hover:bg-error-container rounded-lg text-error" title="Hapus">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isDeleted && (
                            <button onClick={() => onHardDelete(item)} className="p-1.5 hover:bg-error/20 rounded-lg text-error" title="Hapus permanen">
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-outline-variant">
          {items.map((item) => {
            const isDeleted = !!item.deleted_at;
            return (
              <div key={item.id} className={`p-4 ${isDeleted ? "opacity-60 bg-error-container/10" : ""}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className={`font-medium text-sm ${isDeleted ? "line-through text-on-surface-variant" : ""}`}>{item.name}</p>
                  {isDeleted && <span className="text-xs text-error">(terhapus)</span>}
                </div>
                <p className="text-xs text-on-surface-variant mb-2">
                  {item.unit} · {fmtPrice(item.base_price)}
                </p>
                <div className="flex gap-2">
                  {!isDeleted && (
                    <>
                      <button onClick={() => onEdit(item)} className="flex items-center gap-1 px-3 py-1 border border-outline-variant rounded-lg text-xs hover:bg-surface-container-high">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => onDelete(item)} className="flex items-center gap-1 px-3 py-1 border border-error rounded-lg text-xs text-error hover:bg-error-container">
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </>
                  )}
                  {isDeleted && (
                    <button onClick={() => onHardDelete(item)} className="flex items-center gap-1 px-3 py-1 border border-error rounded-lg text-xs text-error hover:bg-error-container">
                      <ShieldAlert className="w-3 h-3" /> Hapus Permanen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {items.length === 0 && !isFetching && (
            <p className="p-8 text-center text-sm text-on-surface-variant">Belum ada item pada grup ini.</p>
          )}
        </div>
      </div>
    </section>
  );
}

type StatusFilter = "all" | "active" | "inactive" | "deleted";

export function LaundryItemTable() {
  const [pcPage, setPcPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortCol>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<LaundryItem | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<LaundryItem | null>(null);
  const [hardDeleteConfirmName, setHardDeleteConfirmName] = useState("");

  const del = useDeleteLaundryItem();
  const hardDel = useHardDeleteLaundryItem();

  const includeDeleted = statusFilter === "deleted" || statusFilter === "all";

  const commonFilters = {
    search: search.trim() || undefined,
    is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
    include_deleted: includeDeleted,
    sort_by: sortBy,
    sort_dir: sortDir,
  };

  // Kg items — always fetched in full (there are very few kg items)
  const { data: kgData, isFetching: kgFetching, isError: kgError } = useLaundryItems({
    ...commonFilters,
    page: 1,
    limit: 50,
  });

  // Pcs items — paginated separately
  const { data: pcsData, isFetching: pcsFetching, isError: pcsError } = useLaundryItems({
    ...commonFilters,
    page: pcPage,
    limit: 10,
  });

  const isError = kgError || pcsError;
  const isFetching = kgFetching || pcsFetching;

  // Filter by unit after fetching; if "deleted" status selected, only show deleted items
  const kiloItems = (kgData?.data ?? []).filter((it) => {
    if (!isKiloUnit(it.unit)) return false;
    if (statusFilter === "deleted") return !!it.deleted_at;
    return true;
  });
  const pcsItems = (pcsData?.data ?? []).filter((it) => {
    if (isKiloUnit(it.unit)) return false;
    if (statusFilter === "deleted") return !!it.deleted_at;
    return true;
  });
  const pcsPagination = pcsData?.pagination;

  const toggleSort = (col: SortCol) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPcPage(1);
  };

  const handleDelete = (item: LaundryItem) => {
    if (!confirm(`Hapus item "${item.name}"? Item dapat dihapus permanen setelahnya.`)) return;
    del.mutate(item.id);
  };

  const handleHardDelete = (item: LaundryItem) => {
    setHardDeleteTarget(item);
    setHardDeleteConfirmName("");
  };

  const confirmHardDelete = () => {
    if (!hardDeleteTarget) return;
    if (hardDeleteConfirmName !== hardDeleteTarget.name) return;
    hardDel.mutate(hardDeleteTarget.id, {
      onSuccess: () => setHardDeleteTarget(null),
      onError: () => setHardDeleteTarget(null),
    });
  };

  const openEdit = (item: LaundryItem) => {
    setEditing(item);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPcPage(1); }}
              placeholder="Cari nama item..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPcPage(1); }}
            className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="deleted">Terhapus</option>
          </select>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Tambah Item
        </button>
      </div>

      {isError && (
        <p className="p-4 text-sm text-error bg-surface border border-outline-variant rounded-xl">
          Gagal memuat data. Coba lagi.
        </p>
      )}

      {pcPage === 1 && (
        <ItemsSection
          title="Per Kilo (kg)"
          icon={<Scale className="w-4 h-4 text-primary" />}
          items={kiloItems}
          isFetching={isFetching}
          sortBy={sortBy}
          sortDir={sortDir}
          onToggleSort={toggleSort}
          onEdit={openEdit}
          onDelete={handleDelete}
          onHardDelete={handleHardDelete}
        />
      )}

      <ItemsSection
        title="Per Pcs (satuan)"
        icon={<Package className="w-4 h-4 text-primary" />}
        items={pcsItems}
        isFetching={isFetching}
        sortBy={sortBy}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        onEdit={openEdit}
        onDelete={handleDelete}
        onHardDelete={handleHardDelete}
      />

      {pcsPagination && pcsPagination.total > 0 && (
        <div className="bg-surface-container-low p-4 flex flex-col sm:flex-row items-center justify-between gap-2 border border-outline-variant rounded-xl">
          <p className="text-xs text-on-surface-variant">
            Menampilkan {Math.min((pcPage - 1) * 10 + 1, pcsPagination.total)}–
            {Math.min(pcPage * 10, pcsPagination.total)} dari {pcsPagination.total} item (satuan)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPcPage((p) => p - 1)}
              disabled={pcPage <= 1}
              className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(pcsPagination.totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPcPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    pcPage === p
                      ? "bg-primary text-on-primary"
                      : "bg-surface border border-outline-variant hover:bg-surface-container-high"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPcPage((p) => p + 1)}
              disabled={pcPage >= pcsPagination.totalPages}
              className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {(modal === "create" || modal === "edit") && (
        <LaundryItemFormModal
          initial={modal === "edit" ? editing : null}
          onClose={closeModal}
        />
      )}

      {hardDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg text-error">Hapus Permanen</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Item <strong className="text-on-surface">"{hardDeleteTarget.name}"</strong> akan dihapus permanen dan tidak bisa dikembalikan. Ketik nama item untuk konfirmasi.
                </p>
              </div>
            </div>
            <input
              type="text"
              value={hardDeleteConfirmName}
              onChange={(e) => setHardDeleteConfirmName(e.target.value)}
              placeholder={hardDeleteTarget.name}
              className="w-full px-4 py-2.5 border-2 border-outline-variant rounded-xl text-sm focus:outline-none focus:border-error"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setHardDeleteTarget(null)}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-medium hover:bg-surface-container-low"
              >
                Batal
              </button>
              <button
                onClick={confirmHardDelete}
                disabled={hardDeleteConfirmName !== hardDeleteTarget.name || hardDel.isPending}
                className="flex-1 py-2.5 bg-error text-on-error rounded-xl text-sm font-bold disabled:opacity-40 hover:opacity-90"
              >
                {hardDel.isPending ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
