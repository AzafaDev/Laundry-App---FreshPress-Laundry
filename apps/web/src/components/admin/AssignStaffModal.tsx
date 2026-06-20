"use client";

import { useState } from "react";
import {
  X,
  UserPlus,
  Users,
  Search,
  Trash2,
  Loader2,
  CheckCircle,
  CalendarDays,
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import {
  useAssignUserToOutlet,
  useOutletAssignments,
  useUnassignUser,
} from "@/hooks/useOutlets";
import { EmployeeShiftModal } from "@/components/admin/EmployeeShiftModal";
import type { Outlet } from "@/types/outlet.types";
import type { User, UserRole } from "@/types/user.types";
import type { AssignedUser } from "@/services/outlet.service";

interface Props {
  outlet: Outlet;
  onClose: () => void;
}

// Roles that make sense as outlet staff (excludes super_admin)
const ASSIGNABLE_ROLES: UserRole[] = [
  "outlet_admin",
  "washing_worker",
  "ironing_worker",
  "packing_worker",
  "driver",
];

const ROLE_OPTIONS: Array<{ value: UserRole | "all"; label: string }> = [
  { value: "all", label: "Semua role" },
  { value: "outlet_admin", label: "Outlet Admin" },
  { value: "washing_worker", label: "Washing Worker" },
  { value: "ironing_worker", label: "Ironing Worker" },
  { value: "packing_worker", label: "Packing Worker" },
  { value: "driver", label: "Driver" },
];

export function AssignStaffModal({ outlet, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [recentlyAssigned, setRecentlyAssigned] = useState<string | null>(null);
  const [shiftEmployee, setShiftEmployee] = useState<User | null>(null);
  const [conflictUser, setConflictUser] = useState<User | null>(null);
  const toUser = (u: AssignedUser): User =>
    ({ ...u, outlet_id: outlet.id, created_at: u.assigned_at, updated_at: u.assigned_at, deleted_at: null, phone: u.phone ?? null }) as unknown as User;

  const { data: assigned = [], isLoading: assignedLoading } =
    useOutletAssignments(outlet.id);

  const { data: usersPage } = useUsers({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
  });

  const assign = useAssignUserToOutlet();
  const unassign = useUnassignUser(outlet.id);

  const assignedIds = new Set(assigned.map((a) => a.id));

  const doAssign = async (userId: string) => {
    try {
      await assign.mutateAsync({ outletId: outlet.id, userId });
      setRecentlyAssigned(userId);
      setTimeout(() => setRecentlyAssigned(null), 1500);
    } catch {
      /* handled via mutation state */
    }
  };

  const handleAssign = (user: User) => {
    // Already assigned to a different outlet → show confirmation first
    if (user.outlet_id && user.outlet_id !== outlet.id) {
      setConflictUser(user);
      return;
    }
    doAssign(user.id);
  };

  const candidates = (usersPage?.items ?? []).filter(
    (u) =>
      ASSIGNABLE_ROLES.includes(u.role) &&
      !assignedIds.has(u.id) &&
      !u.deleted_at,
  );

  // Split candidates: unassigned vs assigned-to-other-outlet
  const unassignedCandidates = candidates.filter((u) => !u.outlet_id);
  const assignedElsewhereCandidates = candidates.filter(
    (u) => u.outlet_id && u.outlet_id !== outlet.id,
  );

  return (
    <>
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant max-h-[92vh] flex flex-col">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">Assign Staff</h3>
              <p className="text-xs text-on-surface-variant">{outlet.name}</p>
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
          {/* Current assignments */}
          <section>
            <h4 className="text-sm font-bold text-on-surface mb-3">
              Staff Saat Ini ({assigned.length})
            </h4>
            {assignedLoading ? (
              <p className="text-sm text-on-surface-variant flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat…
              </p>
            ) : assigned.length === 0 ? (
              <p className="text-sm text-on-surface-variant px-3 py-2 bg-surface-container-low rounded-md">
                Belum ada staff yang di-assign ke outlet ini.
              </p>
            ) : (
              <ul className="space-y-2">
                {assigned.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 p-3 bg-surface border border-outline-variant rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold flex-shrink-0">
                        {u.full_name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">
                          {u.full_name}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {u.email} ·{" "}
                          <span className="capitalize">
                            {u.role.replace(/_/g, " ")}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setShiftEmployee(toUser(u))}
                        className="p-2 rounded-md hover:bg-primary/10 text-primary"
                        aria-label="Atur shift"
                        title="Atur Shift"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Unassign ${u.full_name} dari ${outlet.name}?`)) {
                            unassign.mutate(u.id);
                          }
                        }}
                        disabled={unassign.isPending}
                        className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50"
                        aria-label="Unassign"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Add new staff */}
          <section>
            <h4 className="text-sm font-bold text-on-surface mb-3">
              Tambah Staff
            </h4>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau email…"
                  className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as UserRole | "all")
                }
                className="px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {candidates.length === 0 ? (
              <p className="text-sm text-on-surface-variant px-3 py-2 bg-surface-container-low rounded-md">
                Tidak ada kandidat yang cocok.
              </p>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto">
                {/* Unassigned candidates */}
                {unassignedCandidates.length > 0 && (
                  <ul className="space-y-2">
                    {unassignedCandidates.map((u) => (
                      <CandidateRow
                        key={u.id}
                        user={u}
                        justAssigned={recentlyAssigned === u.id}
                        isPending={assign.isPending}
                        onAssign={() => handleAssign(u)}
                      />
                    ))}
                  </ul>
                )}

                {/* Assigned-elsewhere candidates */}
                {assignedElsewhereCandidates.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                      ⚠️ Sudah di-assign ke outlet lain
                    </p>
                    <ul className="space-y-2">
                      {assignedElsewhereCandidates.map((u) => (
                        <CandidateRow
                          key={u.id}
                          user={u}
                          justAssigned={recentlyAssigned === u.id}
                          isPending={assign.isPending}
                          onAssign={() => handleAssign(u)}
                          currentOutletName={u.outlet?.name}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
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

    {shiftEmployee && (
      <EmployeeShiftModal
        employee={shiftEmployee}
        onClose={() => setShiftEmployee(null)}
      />
    )}

    {/* Conflict confirmation modal */}
    {conflictUser && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-on-surface">Staff sudah di outlet lain</h4>
              <p className="text-sm text-on-surface-variant mt-1">
                <span className="font-medium text-on-surface">{conflictUser.full_name}</span> saat ini
                di-assign ke <span className="font-medium text-on-surface">{conflictUser.outlet?.name ?? "outlet lain"}</span>.
              </p>
              <p className="text-sm text-on-surface-variant mt-2">Pilih tindakan:</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={async () => {
                await doAssign(conflictUser.id);
                setConflictUser(null);
              }}
              disabled={assign.isPending}
              className="w-full px-4 py-3 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all text-left"
            >
              <p className="font-semibold">Pindahkan ke {outlet.name}</p>
              <p className="text-xs opacity-80 font-normal mt-0.5">
                Hapus dari {conflictUser.outlet?.name ?? "outlet lama"}, assign ke outlet ini
              </p>
            </button>
            <button
              onClick={() => setConflictUser(null)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition-all text-left"
            >
              <p className="font-semibold">Batalkan</p>
              <p className="text-xs text-on-surface-variant font-normal mt-0.5">
                Pilih staff lain untuk di-assign ke {outlet.name}
              </p>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function CandidateRow({
  user,
  justAssigned,
  isPending,
  onAssign,
  currentOutletName,
}: {
  user: User;
  justAssigned: boolean;
  isPending: boolean;
  onAssign: () => void;
  currentOutletName?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 p-3 bg-surface border border-outline-variant rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-semibold flex-shrink-0">
          {user.full_name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-on-surface truncate">{user.full_name}</p>
          <p className="text-xs text-on-surface-variant truncate">
            {user.email} · <span className="capitalize">{user.role.replace(/_/g, " ")}</span>
          </p>
          {currentOutletName && (
            <p className="text-xs text-amber-600 mt-0.5">📍 {currentOutletName}</p>
          )}
        </div>
      </div>
      <button
        onClick={onAssign}
        disabled={isPending}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all flex-shrink-0 ${
          justAssigned
            ? "bg-primary/10 text-primary"
            : currentOutletName
            ? "bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
            : "bg-primary text-on-primary hover:opacity-90 disabled:opacity-60"
        }`}
      >
        {justAssigned ? (
          <><CheckCircle className="w-4 h-4" /> Terassign</>
        ) : (
          <><UserPlus className="w-4 h-4" /> Assign</>
        )}
      </button>
    </li>
  );
}
