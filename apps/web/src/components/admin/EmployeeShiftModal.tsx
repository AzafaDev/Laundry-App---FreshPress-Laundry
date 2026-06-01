"use client";

import { useState } from "react";
import { X, Calendar, Trash2, Plus, Loader2 } from "lucide-react";
import {
  useEmployeeShifts,
  useAssignEmployeeShift,
  useRemoveEmployeeShift,
} from "@/hooks/useShifts";
import { useWorkShifts } from "@/hooks/useShifts";
import type { User } from "@/types/user.types";
import type { AssignEmployeeShiftPayload } from "@/types/shift.types";
import { DAY_NAMES } from "@/types/shift.types";

interface Props {
  employee: User;
  onClose: () => void;
}

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

export function EmployeeShiftModal({ employee, onClose }: Props) {
  const { data: employeeShifts = [], isLoading } = useEmployeeShifts(
    employee.id,
  );
  const { data: shiftsData } = useWorkShifts({ is_active: true });
  const assign = useAssignEmployeeShift(employee.id);
  const remove = useRemoveEmployeeShift(employee.id);

  const allShifts = shiftsData?.items ?? [];

  const [form, setForm] = useState<AssignEmployeeShiftPayload>({
    shift_id: "",
    outlet_id: employee.outlet_id ?? "",
    day_of_week: 1,
    is_active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.shift_id) {
      setFormError("Pilih shift terlebih dahulu.");
      return;
    }
    if (!form.outlet_id) {
      setFormError("Employee belum di-assign ke outlet manapun.");
      return;
    }
    try {
      await assign.mutateAsync(form);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Gagal menambah jadwal shift.";
      setFormError(msg);
    }
  };

  const activeShifts = employeeShifts.filter((s) => s.is_active);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">
                Jadwal Shift
              </h3>
              <p className="text-xs text-on-surface-variant">
                {employee.full_name} ·{" "}
                <span className="capitalize">
                  {employee.role.replace(/_/g, " ")}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Current shifts */}
          <section>
            <h4 className="text-sm font-bold text-on-surface mb-3">
              Jadwal Aktif ({activeShifts.length})
            </h4>
            {isLoading ? (
              <p className="text-sm text-on-surface-variant flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat…
              </p>
            ) : activeShifts.length === 0 ? (
              <p className="text-sm text-on-surface-variant px-3 py-2 bg-surface-container-low rounded-md">
                Belum ada jadwal shift.
              </p>
            ) : (
              <div className="space-y-2">
                {activeShifts.map((es) => (
                  <div
                    key={es.id}
                    className="flex items-center justify-between gap-3 p-3 bg-surface border border-outline-variant rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {DAY_NAMES[es.day_of_week]} · {es.shift.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatTime(es.shift.start_time)} –{" "}
                        {formatTime(es.shift.end_time)} · {es.outlet.name}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Hapus jadwal shift ini?")) {
                          remove.mutate(es.id);
                        }
                      }}
                      disabled={remove.isPending}
                      className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50"
                      aria-label="Hapus shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Add new shift */}
          <section>
            <h4 className="text-sm font-bold text-on-surface mb-3">
              Tambah Jadwal
            </h4>
            <form onSubmit={handleAssign} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                    Shift
                  </label>
                  <select
                    value={form.shift_id}
                    onChange={(e) =>
                      setForm({ ...form, shift_id: e.target.value })
                    }
                    className={selectClass}
                  >
                    <option value="">-- Pilih Shift --</option>
                    {allShifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatTime(s.start_time)}–
                        {formatTime(s.end_time)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">
                    Hari
                  </label>
                  <select
                    value={form.day_of_week}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        day_of_week: parseInt(e.target.value),
                      })
                    }
                    className={selectClass}
                  >
                    {DAY_NAMES.map((name, idx) => (
                      <option key={idx} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!employee.outlet_id && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
                  Employee belum di-assign ke outlet. Assign outlet terlebih dahulu di halaman Outlets.
                </p>
              )}

              {formError && (
                <p className="text-sm text-error bg-error-container/30 px-3 py-2 rounded-md">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={assign.isPending || !employee.outlet_id}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
              >
                <Plus className="w-4 h-4" />
                {assign.isPending ? "Menambah..." : "Tambah Jadwal"}
              </button>
            </form>
          </section>
        </div>

        <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

const selectClass =
  "w-full px-3 py-2.5 rounded-xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-sm";
