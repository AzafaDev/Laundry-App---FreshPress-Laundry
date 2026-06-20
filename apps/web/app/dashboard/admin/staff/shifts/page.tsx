"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Users, CalendarDays } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useUsers } from "@/hooks/useUsers";
import { useEmployeeShifts } from "@/hooks/useShifts";
import { shiftService } from "@/services/shift.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import type { User } from "@/types/user.types";
import type { EmployeeShift, EmployeeShiftListResponse } from "@/types/shift.types";

const WORKER_ROLES = ["washing_worker", "ironing_worker", "packing_worker", "driver"];
const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function formatTime(t: string) {
  if (!t) return "—";
  if (t.includes("T")) {
    const d = new Date(t);
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  }
  return t.slice(0, 5);
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function getMondayWeek(base: Date): Date[] {
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function shiftStyle(name: string): { bg: string; text: string; border: string } {
  const n = name.toLowerCase();
  if (n.includes("pagi"))  return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300" };
  if (n.includes("siang")) return { bg: "bg-blue-50",    text: "text-blue-800",    border: "border-blue-300" };
  if (n.includes("malam")) return { bg: "bg-violet-50",  text: "text-violet-800",  border: "border-violet-300" };
  return                          { bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-300" };
}

function findShiftForDate(
  data: { recurring: EmployeeShift[]; date_specific: EmployeeShift[] } | undefined,
  date: Date,
): EmployeeShift | null {
  if (!data) return null;
  const dateStr = toDateStr(date);
  const specific = data.date_specific.find((s) => s.is_active && s.date?.startsWith(dateStr));
  if (specific) return specific;
  const dow = date.getDay();
  return data.recurring.find((s) => s.is_active && s.day_of_week === dow) ?? null;
}

function ShiftCell({ shift, isToday }: { shift: EmployeeShift | null; isToday: boolean }) {
  if (!shift) {
    return (
      <td className={`px-1 py-2 text-center align-middle ${isToday ? "bg-blue-50/60" : ""}`}>
        <span className="text-xs text-on-surface-variant/40">—</span>
      </td>
    );
  }
  const s = shiftStyle(shift.shift.name);
  return (
    <td className={`px-1 py-2 text-center align-middle ${isToday ? "bg-blue-50/60" : ""}`}>
      <span
        className={`inline-flex flex-col items-center px-1.5 py-0.5 rounded-md border text-xs font-medium ${s.bg} ${s.text} ${s.border} ${isToday ? "ring-1 ring-offset-1 ring-current" : ""}`}
      >
        <span>{shift.shift.name}</span>
        <span className="opacity-60 font-normal" style={{ fontSize: "10px" }}>
          {formatTime(shift.shift.start_time)}–{formatTime(shift.shift.end_time)}
        </span>
      </span>
    </td>
  );
}

function WeekRow({ employee, weekDates, todayStr }: { employee: User; weekDates: Date[]; todayStr: string }) {
  const { data, isLoading } = useEmployeeShifts(employee.id);

  return (
    <tr className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
      <td className="px-4 py-3 min-w-[150px]">
        <p className="text-sm font-medium text-on-surface leading-tight">{employee.full_name}</p>
        <p className="text-xs text-on-surface-variant capitalize">{employee.role.replace(/_/g, " ")}</p>
      </td>
      {isLoading
        ? weekDates.map((_, i) => (
            <td key={i} className="px-1 py-2 text-center">
              <span className="inline-block w-8 h-4 bg-surface-container-low rounded animate-pulse" />
            </td>
          ))
        : weekDates.map((date) => {
            const shift = findShiftForDate(data, date);
            const isToday = toDateStr(date) === todayStr;
            return <ShiftCell key={toDateStr(date)} shift={shift} isToday={isToday} />;
          })}
    </tr>
  );
}

function MobileCard({ employee, weekDates, todayStr }: { employee: User; weekDates: Date[]; todayStr: string }) {
  const { data } = useEmployeeShifts(employee.id);
  const shifts = weekDates.map((d) => ({ date: d, shift: findShiftForDate(data, d) }));
  const hasShifts = shifts.some((s) => s.shift !== null);

  return (
    <div className="p-4 border-b border-outline-variant">
      <p className="text-sm font-medium text-on-surface">{employee.full_name}</p>
      <p className="text-xs text-on-surface-variant capitalize mb-2">{employee.role.replace(/_/g, " ")}</p>
      {!hasShifts ? (
        <p className="text-xs text-on-surface-variant italic">Tidak ada shift minggu ini</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {shifts.filter((s) => s.shift).map(({ date, shift }) => {
            const st = shiftStyle(shift!.shift.name);
            const isToday = toDateStr(date) === todayStr;
            return (
              <span
                key={toDateStr(date)}
                className={`px-2 py-0.5 text-xs rounded-md border font-medium ${st.bg} ${st.text} ${st.border} ${isToday ? "ring-1 ring-current" : ""}`}
              >
                {DAY_SHORT[date.getDay()]} · {shift!.shift.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OutletShiftSchedulePage() {
  const user = useEmployeeAuthStore((s) => s.user);
  const outletId = user?.outlet_id ?? undefined;

  const [weekBase, setWeekBase] = useState(() => new Date());
  const [roleFilter, setRoleFilter] = useState("");

  const weekDates = useMemo(() => getMondayWeek(weekBase), [weekBase]);
  const todayStr = toDateStr(new Date());

  const weekLabel = `${weekDates[0].toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;

  const { data, isLoading } = useUsers({ outlet_id: outletId, limit: 100 });
  const allEmployees = (data?.items ?? []).filter((e: User) => WORKER_ROLES.includes(e.role));
  const employees = allEmployees.filter((e: User) => !roleFilter || e.role === roleFilter);

  const totalEmployees = allEmployees.length;

  // Fetch all employee shifts for stat cards
  const shiftQueries = useQueries({
    queries: allEmployees.map((emp: User) => ({
      queryKey: ["admin", "employees", emp.id, "shifts"],
      queryFn: () => shiftService.listEmployeeShifts(emp.id),
      enabled: !!emp.id,
    })),
  });

  const today = new Date();
  const workingToday = shiftQueries.filter(({ data: d }) => {
    if (!d) return false;
    return findShiftForDate(d as EmployeeShiftListResponse, today) !== null;
  }).length;
  const offToday = totalEmployees - workingToday;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Jadwal Shift</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Outlet {user?.outlet_name ?? "ini"} — tampilan read-only
          </p>
        </div>
        {/* Week nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); }}
            className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
            aria-label="Minggu sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-on-surface min-w-[190px] text-center">{weekLabel}</span>
          <button
            onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); }}
            className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
            aria-label="Minggu berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekBase(new Date())}
            className="px-3 py-2 text-xs rounded-lg border border-outline-variant hover:bg-surface-container transition-colors flex items-center gap-1"
          >
            <CalendarDays className="w-3.5 h-3.5" /> Hari ini
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total karyawan", value: totalEmployees, sub: "di outlet ini" },
          { label: "Bertugas hari ini", value: workingToday, sub: DAY_LONG[today.getDay()] },
          { label: "Libur hari ini", value: offToday, sub: "off jadwal" },
          { label: "Sedang tampil", value: employees.length, sub: roleFilter ? roleFilter.replace(/_/g, " ") : "semua role" },
        ].map((c) => (
          <div key={c.label} className="bg-surface-container-low rounded-xl p-4">
            <p className="text-xs text-on-surface-variant mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-on-surface">{c.value}</p>
            <p className="text-xs text-on-surface-variant mt-0.5 capitalize">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Legend + filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap text-xs text-on-surface-variant">
          {[
            { label: "Pagi", bg: "bg-emerald-200" },
            { label: "Siang", bg: "bg-blue-200" },
            { label: "Malam", bg: "bg-violet-200" },
            { label: "Lainnya", bg: "bg-amber-200" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${l.bg}`} />
              {l.label}
            </span>
          ))}
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm px-3 py-2 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary"
        >
          <option value="">Semua role</option>
          <option value="washing_worker">Washing worker</option>
          <option value="ironing_worker">Ironing worker</option>
          <option value="packing_worker">Packing worker</option>
          <option value="driver">Driver</option>
        </select>
      </div>

      {/* Weekly grid — desktop */}
      <div className="hidden md:block border border-outline-variant rounded-xl overflow-hidden bg-surface shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-on-surface-variant">Memuat data karyawan…</div>
        ) : employees.length === 0 ? (
          <div className="p-10 text-center text-sm text-on-surface-variant flex flex-col items-center gap-2">
            <Users className="w-8 h-8 opacity-30" />
            <p>Tidak ada karyawan ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "160px" }} />
                {weekDates.map((_, i) => <col key={i} style={{ width: "100px" }} />)}
              </colgroup>
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">Karyawan</th>
                  {weekDates.map((d) => {
                    const isToday = toDateStr(d) === todayStr;
                    return (
                      <th
                        key={toDateStr(d)}
                        className={`px-1 py-3 text-center text-xs font-semibold ${isToday ? "bg-blue-50 text-blue-700" : "text-on-surface-variant"}`}
                      >
                        {DAY_SHORT[d.getDay()]}
                        <span className={`block font-normal ${isToday ? "text-blue-600" : "text-on-surface-variant/60"}`} style={{ fontSize: "10px" }}>
                          {d.getDate()}/{d.getMonth() + 1}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp: User) => (
                  <WeekRow key={emp.id} employee={emp} weekDates={weekDates} todayStr={todayStr} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden border border-outline-variant rounded-xl overflow-hidden bg-surface shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-on-surface-variant">Memuat…</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-sm text-on-surface-variant">Tidak ada karyawan.</div>
        ) : (
          employees.map((emp: User) => (
            <MobileCard key={emp.id} employee={emp} weekDates={weekDates} todayStr={todayStr} />
          ))
        )}
      </div>
    </div>
  );
}
