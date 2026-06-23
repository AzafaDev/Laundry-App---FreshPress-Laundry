"use client";

import { useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UserPlus,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { useOutlets, useSoftDeleteOutlet, useDeleteOutlet } from "@/hooks/useOutlets";
import type { Outlet } from "@/types/outlet.types";
import { OutletForm } from "./OutletForm";
import { AssignStaffModal } from "./AssignStaffModal";

export function OutletAdminTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "deleted">("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Outlet | null>(null);
  const [assigningTo, setAssigningTo] = useState<Outlet | null>(null);

  const { data, isFetching, isError } = useOutlets({
    page,
    limit: 10,
    search: search.trim() || undefined,
    include_deleted: statusFilter === "deleted" || undefined,
  });
  const softDelete = useSoftDeleteOutlet();
  const hardDelete = useDeleteOutlet();

  const allItems = data?.items ?? [];
  const items = allItems.filter((o) => {
    if (statusFilter === "deleted") return !!o.deleted_at;
    if (statusFilter === "active") return !o.deleted_at && o.is_active;
    if (statusFilter === "inactive") return !o.deleted_at && !o.is_active;
    return !o.deleted_at;
  });
  const pagination = data?.pagination;

  const handleSoftDelete = (outlet: Outlet) => {
    if (!confirm(`Hapus outlet "${outlet.name}"?`)) return;
    softDelete.mutate(outlet.id);
  };

  const handleHardDelete = (outlet: Outlet) => {
    if (!confirm(`Hapus PERMANEN outlet "${outlet.name}"?\n\nTindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.`)) return;
    hardDelete.mutate(outlet.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari outlet, kota..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
          className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
          <option value="deleted">Terhapus</option>
        </select>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Outlet
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 font-semibold">Kota</th>
                <th className="text-left px-4 py-3 font-semibold">Koordinat</th>
                <th className="text-left px-4 py-3 font-semibold">Radius</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-error">
                    Gagal memuat outlet.
                  </td>
                </tr>
              )}
              {!isError && items.length === 0 && !isFetching && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-on-surface-variant"
                  >
                    Belum ada outlet.
                  </td>
                </tr>
              )}
              {items.map((o) => {
                const isDeleted = !!o.deleted_at;
                return (
                  <tr
                    key={o.id}
                    className={`border-t border-outline-variant ${isDeleted ? "bg-error-container/10 opacity-60" : "hover:bg-surface-container-low"}`}
                  >
                    <td className="px-4 py-3">
                      <p className={`font-medium ${isDeleted ? "line-through text-on-surface-variant" : "text-on-surface"}`}>{o.name}</p>
                      <p className="text-xs text-on-surface-variant truncate max-w-[180px]">{o.address}</p>
                      {isDeleted && <span className="text-xs text-error">(terhapus)</span>}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      <p>{o.city}</p>
                      <p className="text-xs">{o.province}</p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {o.latitude != null && o.longitude != null ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />
                          {Number(o.latitude).toFixed(4)},{" "}
                          {Number(o.longitude).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-xs text-error">Belum di-geocode</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {o.service_radius_km ? `${o.service_radius_km} km` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isDeleted ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-error/10 text-error">Terhapus</span>
                      ) : o.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-md bg-surface-container-high text-on-surface-variant">Nonaktif</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {!isDeleted && (
                          <>
                            <button
                              onClick={() => setAssigningTo(o)}
                              className="p-2 rounded-md hover:bg-primary/10 text-primary"
                              aria-label="Assign staff"
                              title="Assign staff"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditing(o)}
                              className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant"
                              aria-label="Edit outlet"
                              title="Edit outlet"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(o)}
                              disabled={softDelete.isPending}
                              className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50"
                              aria-label="Hapus outlet"
                              title="Hapus outlet"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isDeleted && (
                          <button
                            onClick={() => handleHardDelete(o)}
                            disabled={hardDelete.isPending}
                            className="p-2 rounded-md hover:bg-error/20 text-error disabled:opacity-50"
                            aria-label="Hapus permanen"
                            title="Hapus permanen dari database"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container-low text-sm text-on-surface-variant">
            <span>
              {pagination.total === 0
                ? "0 hasil"
                : `Halaman ${pagination.page} dari ${pagination.totalPages} · ${pagination.total} outlet`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isFetching}
                className="p-2 rounded-md hover:bg-surface-container-high disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={pagination.page >= pagination.totalPages || isFetching}
                className="p-2 rounded-md hover:bg-surface-container-high disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <OutletForm
          outlet={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
      {assigningTo && (
        <AssignStaffModal
          outlet={assigningTo}
          onClose={() => setAssigningTo(null)}
        />
      )}
    </div>
  );
}
