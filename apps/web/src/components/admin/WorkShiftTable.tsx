"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useWorkShifts, useDeactivateWorkShift } from "@/hooks/useShifts";
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
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WorkShift | null>(null);

  const { data, isFetching, isError } = useWorkShifts({ page, limit: 15 });
  const deactivate = useDeactivateWorkShift();

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleDeactivate = (shift: WorkShift) => {
    if (!confirm(`Nonaktifkan shift "${shift.name}"?`)) return;
    deactivate.mutate(shift.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-on-surface-variant"
                  >
                    Belum ada shift. Klik "Tambah Shift" untuk membuat yang baru.
                  </td>
                </tr>
              )}
              {items.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-outline-variant hover:bg-surface-container-low"
                >
                  <td className="px-4 py-3 font-medium text-on-surface flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    {s.name}
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
                    {s.is_active ? (
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
                      <button
                        onClick={() => setEditing(s)}
                        className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant"
                        aria-label="Edit shift"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {s.is_active && (
                        <button
                          onClick={() => handleDeactivate(s)}
                          disabled={deactivate.isPending}
                          className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50"
                          aria-label="Nonaktifkan shift"
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
