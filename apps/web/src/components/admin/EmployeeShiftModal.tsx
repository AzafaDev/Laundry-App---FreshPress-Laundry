"use client";

import { useState } from "react";
import { X, Calendar, Trash2, Plus, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useEmployeeShifts,
  useAssignEmployeeShift,
  useRemoveEmployeeShift,
  useWorkShifts,
} from "@/hooks/useShifts";
import type { User } from "@/types/user.types";
import type { AssignEmployeeShiftPayload, EmployeeShift } from "@/types/shift.types";
import { DAY_NAMES } from "@/types/shift.types";

/** Returns array of 7 Dates starting from Monday of the week containing `ref`. */
function getWeekDates(ref: Date): Date[] {
  const dow = ref.getDay(); // 0=Sun
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const SHORT_DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

interface EffectiveWeekViewProps {
  recurring: EmployeeShift[];
  dateSpecific: EmployeeShift[];
}

function EffectiveWeekView({ recurring, dateSpecific }: EffectiveWeekViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();
  const refDate = new Date(today);
  refDate.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(refDate);

  const weekLabel = (() => {
    const first = weekDates[0];
    const last = weekDates[6];
    const fmt = (d: Date) =>
      d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return `${fmt(first)} – ${fmt(last)} ${last.getFullYear()}`;
  })();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-primary" /> Jadwal Efektif
        </h4>
        <div className="flex items-center gap-1 text-xs text-on-surface-variant">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1 rounded hover:bg-surface-container-high"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="min-w-[150px] text-center">{weekLabel}</span>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1 rounded hover:bg-surface-container-high"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date) => {
          const dow = date.getDay(); // 0=Sun
          const dateStr = toLocalDateStr(date);
          const isToday = dateStr === toLocalDateStr(today);

          // Priority: date-specific overrides recurring (latest updated_at wins if multiple)
          const dsMatches = dateSpecific
            .filter((s) => s.date === dateStr)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          const dsShift = dsMatches[0] ?? null;

          const recurringMatches = recurring
            .filter((s) => s.day_of_week === dow)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          const recurringShift = recurringMatches[0] ?? null;

          const effectiveShift = dsShift ?? recurringShift;
          const isOverride = !!dsShift && !!recurringShift;
          const isDateOnly = !!dsShift && !recurringShift;

          return (
            <div
              key={dateStr}
              className={`rounded-xl p-2 border text-center flex flex-col gap-0.5 min-h-[80px] ${
                isToday
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isToday ? "text-primary" : "text-on-surface-variant"}`}>
                {SHORT_DAY[dow]}
              </span>
              <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-on-surface"}`}>
                {date.getDate()}
              </span>
              {effectiveShift ? (
                <div className="mt-1 space-y-0.5">
                  <p className="text-[10px] font-semibold text-on-surface leading-tight truncate" title={effectiveShift.shift.name}>
                    {effectiveShift.shift.name}
                  </p>
                  <p className="text-[9px] text-on-surface-variant">
                    {formatTime(effectiveShift.shift.start_time)}–{formatTime(effectiveShift.shift.end_time)}
                  </p>
                  {isOverride && (
                    <span className="inline-block text-[8px] bg-amber-100 text-amber-700 rounded px-1 leading-tight">
                      override
                    </span>
                  )}
                  {isDateOnly && (
                    <span className="inline-block text-[8px] bg-primary/10 text-primary rounded px-1 leading-tight">
                      khusus
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[9px] text-on-surface-variant mt-1 italic">—</p>
              )}
            </div>
          );
        })}
      </div>

      {weekDates.some((d) => {
        const dateStr = toLocalDateStr(d);
        const dow = d.getDay();
        const hasDs = dateSpecific.some((s) => s.date === dateStr);
        const hasRec = recurring.some((s) => s.day_of_week === dow);
        return hasDs && hasRec;
      }) && (
        <p className="mt-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
          <span className="font-bold">override</span> = jadwal tanggal tertentu menggantikan jadwal rutin hari tersebut.
        </p>
      )}
    </section>
  );
}

function ShiftRow({
  es, onRemove, removing, overriddenSoon = false,
}: {
  es: EmployeeShift;
  onRemove: () => void;
  removing: boolean;
  overriddenSoon?: boolean;
}) {
  const label = es.date
    ? formatDate(es.date)
    : es.day_of_week !== null
    ? DAY_NAMES[es.day_of_week]
    : "—";

  return (
    <div className={`flex items-center justify-between gap-3 p-3 border rounded-lg ${overriddenSoon ? "bg-amber-50 border-amber-200" : "bg-surface border-outline-variant"}`}>
      <div>
        <p className="text-sm font-medium text-on-surface flex items-center flex-wrap gap-1.5">
          {label} · {es.shift.name}
          {es.date && (
            <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">Tanggal tertentu</span>
          )}
          {overriddenSoon && !es.date && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">ditimpa (14 hari ke depan)</span>
          )}
        </p>
        <p className="text-xs text-on-surface-variant">
          {formatTime(es.shift.start_time)} – {formatTime(es.shift.end_time)} · {es.outlet.name}
        </p>
      </div>
      <button
        onClick={onRemove}
        disabled={removing}
        className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50"
        aria-label="Hapus shift"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function EmployeeShiftModal({ employee, onClose }: Props) {
  const { data: employeeShifts, isLoading } = useEmployeeShifts(employee.id);
  const { data: shiftsData } = useWorkShifts({ is_active: true });
  const assign = useAssignEmployeeShift(employee.id);
  const remove = useRemoveEmployeeShift(employee.id);

  const allShifts = shiftsData?.items ?? [];
  const recurring = (employeeShifts?.recurring ?? []).filter((s) => s.is_active);
  const dateSpecific = (employeeShifts?.date_specific ?? []).filter((s) => s.is_active);

  type Mode = "recurring" | "date";
  const [mode, setMode] = useState<Mode>("recurring");
  const [form, setForm] = useState<AssignEmployeeShiftPayload>({
    shift_id: "",
    outlet_id: employee.outlet_id ?? "",
    day_of_week: 1,
    is_active: true,
  });
  const [dateValue, setDateValue] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.shift_id) { setFormError("Pilih shift terlebih dahulu."); return; }
    if (!form.outlet_id) { setFormError("Employee belum di-assign ke outlet manapun."); return; }
    if (mode === "date" && !dateValue) { setFormError("Pilih tanggal terlebih dahulu."); return; }

    const payload: AssignEmployeeShiftPayload =
      mode === "date"
        ? { shift_id: form.shift_id, outlet_id: form.outlet_id, date: dateValue, is_active: true }
        : { shift_id: form.shift_id, outlet_id: form.outlet_id, day_of_week: form.day_of_week, is_active: true };

    try {
      await assign.mutateAsync(payload);
      setDateValue("");
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        "Gagal menambah jadwal shift.";
      setFormError(msg);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant max-h-[92vh] flex flex-col">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">Jadwal Shift</h3>
              <p className="text-xs text-on-surface-variant">
                {employee.full_name} · <span className="capitalize">{employee.role.replace(/_/g, " ")}</span>
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
          {!isLoading && (
            <EffectiveWeekView recurring={recurring} dateSpecific={dateSpecific} />
          )}

          <section>
            <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Jadwal Mingguan Rutin ({recurring.length})
            </h4>
            {isLoading ? (
              <p className="text-sm text-on-surface-variant flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat…
              </p>
            ) : recurring.length === 0 ? (
              <p className="text-sm text-on-surface-variant px-3 py-2 bg-surface-container-low rounded-md">
                Belum ada jadwal rutin.
              </p>
            ) : (
              <div className="space-y-2">
                {recurring.map((es) => {
                  // Check if any upcoming date this week/next is overridden by date-specific
                  const nextOccurrences = Array.from({ length: 14 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    return d;
                  }).filter((d) => d.getDay() === es.day_of_week);
                  const isOverriddenSoon = nextOccurrences.some((d) =>
                    dateSpecific.some((ds) => ds.date === toLocalDateStr(d))
                  );
                  return (
                  <ShiftRow
                    key={es.id}
                    es={es}
                    removing={remove.isPending}
                    overriddenSoon={isOverriddenSoon}
                    onRemove={() => { if (confirm("Hapus jadwal shift ini?")) remove.mutate(es.id); }}
                  />
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Jadwal Tanggal Tertentu ({dateSpecific.length})
            </h4>
            {!isLoading && dateSpecific.length === 0 ? (
              <p className="text-sm text-on-surface-variant px-3 py-2 bg-surface-container-low rounded-md">
                Belum ada jadwal tanggal spesifik.
              </p>
            ) : (
              <div className="space-y-2">
                {dateSpecific.map((es) => (
                  <ShiftRow
                    key={es.id}
                    es={es}
                    removing={remove.isPending}
                    onRemove={() => { if (confirm("Hapus jadwal shift ini?")) remove.mutate(es.id); }}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="text-sm font-bold text-on-surface mb-3">Tambah Jadwal</h4>

            <div className="flex rounded-lg border border-outline-variant overflow-hidden mb-4 text-sm">
              <button
                type="button"
                onClick={() => setMode("recurring")}
                className={`flex-1 py-2 font-medium transition-colors ${
                  mode === "recurring"
                    ? "bg-primary text-on-primary"
                    : "bg-surface text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Mingguan (hari)
              </button>
              <button
                type="button"
                onClick={() => setMode("date")}
                className={`flex-1 py-2 font-medium transition-colors ${
                  mode === "date"
                    ? "bg-primary text-on-primary"
                    : "bg-surface text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Tanggal tertentu
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Shift</label>
                  <select
                    value={form.shift_id}
                    onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">-- Pilih Shift --</option>
                    {allShifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatTime(s.start_time)}–{formatTime(s.end_time)})
                      </option>
                    ))}
                  </select>
                </div>

                {mode === "recurring" ? (
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Hari</label>
                    <select
                      value={form.day_of_week}
                      onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value) })}
                      className={selectClass}
                    >
                      {DAY_NAMES.map((name, idx) => (
                        <option key={idx} value={idx}>{name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant mb-1 block">Tanggal</label>
                    <input
                      type="date"
                      value={dateValue}
                      min={todayStr}
                      onChange={(e) => setDateValue(e.target.value)}
                      className={selectClass}
                    />
                  </div>
                )}
              </div>

              {!employee.outlet_id && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
                  Employee belum di-assign ke outlet. Assign outlet terlebih dahulu di halaman Outlets.
                </p>
              )}

              {formError && (
                <p className="text-sm text-error bg-error-container/30 px-3 py-2 rounded-md">{formError}</p>
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
