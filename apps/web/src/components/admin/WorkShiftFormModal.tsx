"use client";

import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { useCreateWorkShift, useUpdateWorkShift } from "@/hooks/useShifts";
import type {
  WorkShift,
  CreateWorkShiftPayload,
  UpdateWorkShiftPayload,
} from "@/types/shift.types";

interface Props {
  shift: WorkShift | null;
  onClose: () => void;
}

/** Format a DB time string (ISO or HH:MM:SS) to HH:MM for the time input. */
function toTimeInput(timeStr: string): string {
  // Could be "1970-01-01T08:00:00.000Z" or "08:00:00" or "08:00"
  if (timeStr.includes("T")) {
    const d = new Date(timeStr);
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  return timeStr.slice(0, 5); // "08:00:00" → "08:00"
}

export function WorkShiftFormModal({ shift, onClose }: Props) {
  const isEdit = !!shift;
  const create = useCreateWorkShift();
  const update = useUpdateWorkShift();

  const [form, setForm] = useState({
    name: "",
    start_time: "08:00",
    end_time: "16:00",
    description: "",
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shift) {
      setForm({
        name: shift.name,
        start_time: toTimeInput(shift.start_time),
        end_time: toTimeInput(shift.end_time),
        description: shift.description ?? "",
        is_active: shift.is_active,
      });
    }
  }, [shift]);

  const pending = create.isPending || update.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && shift) {
        const payload: UpdateWorkShiftPayload = {
          name: form.name,
          start_time: form.start_time,
          end_time: form.end_time,
          description: form.description || undefined,
          is_active: form.is_active,
        };
        await update.mutateAsync({ id: shift.id, payload });
      } else {
        const payload: CreateWorkShiftPayload = {
          name: form.name,
          start_time: form.start_time,
          end_time: form.end_time,
          description: form.description || undefined,
          is_active: form.is_active,
        };
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Terjadi kesalahan.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">
              {isEdit ? "Edit Shift" : "Tambah Shift"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nama Shift">
            <input
              type="text"
              required
              placeholder="Shift Pagi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mulai (HH:MM)">
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Selesai (HH:MM)">
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) =>
                  setForm({ ...form, end_time: e.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Deskripsi (opsional)">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Keterangan tambahan tentang shift ini..."
              className={`${inputClass} resize-none`}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Shift aktif
          </label>

          {error && (
            <p className="text-sm text-error bg-error-container/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="py-3 px-6 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20"
            >
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
