"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  useWorkShifts,
  useDeleteWorkShift,
  useHardDeleteWorkShift,
} from "@/hooks/useShifts";
import type { WorkShift } from "@/types/shift.types";
import { WorkShiftFormModal } from "./WorkShiftFormModal";

/** Format ISO time string to human-readable HH:MM. */
function formatTime(timeStr: string): string {
  if (!timeStr) return "—";
  if (timeStr.includes("T")) {
    const d = new Date(timeStr);
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  return timeStr.slice(0, 5);
}

export function WorkShiftTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"active" | "deleted">("active");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WorkShift | null>(null);

  const { data, isFetching, isError } = useWorkShifts({
    page,
    limit: 15,
    include_deleted: statusFilter === "deleted" || undefined,
  });

  const softDelete = useDeleteWorkShift();
  const hardDelete = useHardDeleteWorkShift();

  const allItems = data?.items ?? [];
  const items =
    statusFilter === "deleted"
      ? allItems.filter((s) => !!s.deleted_at)
      : allItems.filter((s) => !s.deleted_at);
  const pagination = data?.pagination;

  const handleDelete = (shift: WorkShift) => {
    if (!confirm(`Hapus shift "${shift.name}"?\nShift tidak akan bisa digunakan karyawan.`)) return;
    softDelete.mutate(shift.id);
  };

  const handleHardDelete = (shift: WorkShift) => {
    if (!confirm(`Hapus PERMANEN shift "${shift.name}"?\n\nData tidak dapat dipulihkan.`)) return;
    hardDelete.mutate(shift.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
          className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="active">Aktif</option>
          <option value="deleted">Terhapus</option>
        </select>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah Shift
        </button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nama Shift</th>
                <th className="text-left px-4 py-3 font-semibold">Jam Mulai</th>
                <th className="text-left px-4 py-3 font-semibold">Jam Selesai</th>
                <th className="text-left px-4 py-3 font-semibold">Deskripsi</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-error">
                    Gagal memuat data shift.
                  </td>
                </tr>
              )}
              {!isError && items.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                    {statusFilter === "deleted"
                      ? "Tidak ada shift yang terhapus."
                      : 'Belum ada shift. Klik "Tambah Shift" untuk membuat yang baru.'}
                  </td>
                </tr>
              )}
              {items.map((s) => {
                const isDeleted = !!s.deleted_at;
                return (
                  <tr
                    key={s.id}
                    className={`border-t border-outline-variant ${
                      isDeleted
                        ? "bg-error-container/10 opacity-60"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className={isDeleted ? "line-through text-on-surface-variant" : ""}>
                          {s.name}
                        </span>
                        {isDeleted && (
                          <span className="text-xs text-error font-normal">(terhapus)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant font-mono">
                      {formatTime(s.start_time)}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant font-mono">
                      {formatTime(s.end_time)}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant max-w-xs truncate">
                      {s.description ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isDeleted ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-error/10 text-error">
                          Terhapus
                        </span>
                      ) : s.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-md bg-surface-container-high text-on-surface-variant">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {!isDeleted && (
                          <>
                            <button
                              onClick={() => setEditing(s)}
                              className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant"
                              aria-label="Edit shift"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(s)}
                              disabled={softDelete.isPending}
                              className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50"
                              aria-label="Hapus shift"
                              title="Soft delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isDeleted && (
                          <button
                            onClick={() => handleHardDelete(s)}
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
                ? "0 shift"
                : `Halaman ${pagination.page} dari ${pagination.totalPages} · ${pagination.total} shift`}
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
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
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
        <WorkShiftFormModal
          shift={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
