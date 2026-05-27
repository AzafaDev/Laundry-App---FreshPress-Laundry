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
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import {
  useAssignUserToOutlet,
  useOutletAssignments,
  useUnassignUser,
} from "@/hooks/useOutlets";
import type { Outlet } from "@/types/outlet.types";
import type { UserRole } from "@/types/user.types";

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

  const handleAssign = async (userId: string) => {
    try {
      await assign.mutateAsync({ outletId: outlet.id, userId });
      setRecentlyAssigned(userId);
      setTimeout(() => setRecentlyAssigned(null), 1500);
    } catch {
      /* handled via mutation state */
    }
  };

  const candidates = (usersPage?.items ?? []).filter(
    (u) =>
      ASSIGNABLE_ROLES.includes(u.role) &&
      !assignedIds.has(u.id) &&
      !u.deleted_at,
  );

  return (
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
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Unassign ${u.full_name} dari ${outlet.name}?`,
                          )
                        ) {
                          unassign.mutate(u.id);
                        }
                      }}
                      disabled={unassign.isPending}
                      className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50 flex-shrink-0"
                      aria-label="Unassign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {candidates.map((u) => {
                  const justAssigned = recentlyAssigned === u.id;
                  return (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-3 bg-surface border border-outline-variant rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-semibold flex-shrink-0">
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
                      <button
                        onClick={() => handleAssign(u.id)}
                        disabled={assign.isPending}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          justAssigned
                            ? "bg-primary/10 text-primary"
                            : "bg-primary text-on-primary hover:opacity-90 disabled:opacity-60"
                        }`}
                      >
                        {justAssigned ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Terassign
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" /> Assign
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
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
  );
}
