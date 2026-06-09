"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X, Scale, Package } from "lucide-react";
import {
  useLaundryItems,
  useCreateLaundryItem,
  useUpdateLaundryItem,
  useDeleteLaundryItem,
} from "@/hooks/useLaundryItems";
import type { LaundryItem, CreateLaundryItemPayload } from "@/types/laundryItem.types";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice = (v: string | number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v));

// Units counted as weight-based (priced per kilo). Anything else is per-pcs.
const KILO_UNITS = ["kg", "kilo", "kilos", "kilogram", "kilograms"];

const isKiloUnit = (unit: string) => KILO_UNITS.includes(unit.trim().toLowerCase());

type SortCol = "name" | "base_price";
type SortDir = "asc" | "desc";

// ── Form Modal ────────────────────────────────────────────────────────────────
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
    if (!form.name.trim()) return setError("Nama wajib diisi.");
    if (!form.base_price || form.base_price <= 0) return setError("Harga harus lebih dari 0.");

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
              <input
                list="unit-options"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                placeholder="pcs"
              />
              <datalist id="unit-options">
                <option value="kg" />
                <option value="pcs" />
              </datalist>
              <p className="mt-1 text-xs text-on-surface-variant">
                Masuk grup <span className="font-medium">{grouping}</span>. Gunakan{" "}
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

// ── Items Section (one unit group) ────────────────────────────────────────────
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
}

function ItemsSection({
  title, icon, items, isFetching, sortBy, sortDir, onToggleSort, onEdit, onDelete,
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
        {/* Desktop */}
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
                <th className="px-4 py-2.5 text-xs font-semibold">Status</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-outline-variant ${isFetching ? "opacity-60" : ""}`}>
              {items.length === 0 && !isFetching ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-on-surface-variant">
                    Belum ada item pada grup ini.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-4 py-2.5 font-medium text-sm">{item.name}</td>
                    <td className="px-4 py-2.5 text-sm text-on-surface-variant max-w-xs truncate">
                      {item.description ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-sm">{item.unit}</td>
                    <td className="px-4 py-2.5 text-sm font-medium">{fmtPrice(item.base_price)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.is_active
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-surface-container-highest text-on-surface-variant"
                        }`}
                      >
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 hover:bg-error-container rounded-lg text-error"
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

        {/* Mobile */}
        <div className="md:hidden divide-y divide-outline-variant">
          {items.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-sm">{item.name}</p>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.is_active
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {item.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-2">
                {item.unit} · {fmtPrice(item.base_price)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-1 px-3 py-1 border border-outline-variant rounded-lg text-xs hover:bg-surface-container-high"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="flex items-center gap-1 px-3 py-1 border border-error rounded-lg text-xs text-error hover:bg-error-container"
                >
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && !isFetching && (
            <p className="p-8 text-center text-sm text-on-surface-variant">Belum ada item pada grup ini.</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Main Table ────────────────────────────────────────────────────────────────
export function LaundryItemTable() {
  const [pcPage, setPcPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<"" | "true" | "false">("");
  const [sortBy, setSortBy] = useState<SortCol>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<LaundryItem | null>(null);

  const del = useDeleteLaundryItem();

  const commonFilters = {
    search: search.trim() || undefined,
    is_active: isActiveFilter === "" ? undefined : isActiveFilter === "true",
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

  // Filter by unit after fetching
  const kiloItems = (kgData?.data ?? []).filter((it) => isKiloUnit(it.unit));
  const pcsItems  = (pcsData?.data ?? []).filter((it) => !isKiloUnit(it.unit));
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
    if (!confirm(`Hapus item "${item.name}"?`)) return;
    del.mutate(item.id);
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
      {/* Toolbar */}
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
            value={isActiveFilter}
            onChange={(e) => { setIsActiveFilter(e.target.value as "" | "true" | "false"); setPcPage(1); }}
            className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
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

      {/* Kiloan section — only on first pcs page */}
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
      />

      {/* Pagination — for pcs items only */}
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

      {/* Modal */}
      {(modal === "create" || modal === "edit") && (
        <LaundryItemFormModal
          initial={modal === "edit" ? editing : null}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
