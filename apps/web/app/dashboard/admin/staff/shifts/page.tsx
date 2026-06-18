"use client";

import { useState } from "react";
import { Calendar, Search, Users } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useEmployeeShifts } from "@/hooks/useShifts";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { EmployeeShiftModal } from "@/components/admin/EmployeeShiftModal";
import type { User } from "@/types/user.types";
import { DAY_NAMES } from "@/types/shift.types";

const WORKER_ROLES = ["washing_worker", "ironing_worker", "packing_worker", "driver"];

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

function EmployeeShiftBadges({ employeeId }: { employeeId: string }) {
  const { data: shifts = [], isLoading } = useEmployeeShifts(employeeId);
  const active = shifts.filter((s) => s.is_active);

  if (isLoading) return <span className="text-xs text-on-surface-variant">Memuat…</span>;
  if (active.length === 0)
    return <span className="text-xs text-on-surface-variant italic">Belum ada jadwal</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {active.map((es) => (
        <span
          key={es.id}
          className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
        >
          {DAY_NAMES[es.day_of_week]} · {es.shift.name} ({formatTime(es.shift.start_time)}–{formatTime(es.shift.end_time)})
        </span>
      ))}
    </div>
  );
}

export default function OutletShiftSchedulePage() {
  const user = useEmployeeAuthStore((s) => s.user);
  const outletId = user?.outletId ?? undefined;

  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const { data, isLoading } = useUsers({
    outlet_id: outletId,
    limit: 100,
  });

  const employees = (data?.data ?? []).filter((e: User) =>
    WORKER_ROLES.includes(e.role) &&
    (search === "" ||
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Jadwal Shift Outlet</h2>
        <p className="text-base text-on-surface-variant">
          Lihat dan kelola jadwal shift karyawan di outlet{user?.outlet_name ? ` ${user.outlet_name}` : " ini"}.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-on-surface-variant">Memuat data karyawan…</div>
        ) : employees.length === 0 ? (
          <div className="p-10 text-center text-sm text-on-surface-variant flex flex-col items-center gap-2">
            <Users className="w-8 h-8 opacity-30" />
            <p>Tidak ada karyawan ditemukan.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-4 text-sm font-bold">Karyawan</th>
                    <th className="p-4 text-sm font-bold">Role</th>
                    <th className="p-4 text-sm font-bold">Jadwal Shift</th>
                    <th className="p-4 text-sm font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {employees.map((emp: User) => (
                    <tr key={emp.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-sm">{emp.full_name}</p>
                        <p className="text-xs text-on-surface-variant">{emp.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-surface-container-high capitalize">
                          {emp.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <EmployeeShiftBadges employeeId={emp.id} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high ml-auto"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Kelola
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-outline-variant">
              {employees.map((emp: User) => (
                <div key={emp.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{emp.full_name}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{emp.role.replace(/_/g, " ")}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high"
                    >
                      <Calendar className="w-3 h-3" /> Kelola
                    </button>
                  </div>
                  <EmployeeShiftBadges employeeId={emp.id} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedEmployee && (
        <EmployeeShiftModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </>
  );
}
