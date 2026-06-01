"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import type { User, UserRole } from "@/types/user.types";
import { UserFormModal } from "./UserFormModal";
import { EmployeeShiftModal } from "./EmployeeShiftModal";

const ROLE_FILTERS: Array<{ value: UserRole | "all"; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "super_admin", label: "Super Admin" },
  { value: "outlet_admin", label: "Outlet Admin" },
  { value: "washing_worker", label: "Washing Worker" },
  { value: "ironing_worker", label: "Ironing Worker" },
  { value: "packing_worker", label: "Packing Worker" },
  { value: "driver", label: "Driver" },
];

export function UserTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [shiftEmployee, setShiftEmployee] = useState<User | null>(null);

  const { data, isFetching, isError } = useUsers({
    page,
    limit: 10,
    search: search.trim() || undefined,
    role: role === "all" ? undefined : role,
  });
  const deleteUser = useDeleteUser();

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleDelete = (user: User) => {
    if (!confirm(`Hapus user ${user.full_name}?`)) return;
    deleteUser.mutate(user.id);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama atau email..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole | "all");
              setPage(1);
            }}
            className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Telepon</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isError && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-error">
                    Gagal memuat data user.
                  </td>
                </tr>
              )}
              {!isError && items.length === 0 && !isFetching && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-on-surface-variant"
                  >
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}
              {items.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-outline-variant hover:bg-surface-container-low"
                >
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {u.full_name}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {u.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-md bg-primary-container/15 text-primary font-medium capitalize">
                      {u.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active ? (
                      <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-md bg-error-container/40 text-on-error-container">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShiftEmployee(u)}
                        className="p-2 rounded-md hover:bg-primary/10 text-primary"
                        aria-label="Jadwal shift"
                        title="Atur jadwal shift"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditing(u)}
                        className="p-2 rounded-md hover:bg-surface-container-high text-on-surface-variant"
                        aria-label="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deleteUser.isPending}
                        className="p-2 rounded-md hover:bg-error-container/30 text-error disabled:opacity-50"
                        aria-label="Hapus user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container-low text-sm text-on-surface-variant">
            <span>
              {pagination.total === 0
                ? "0 hasil"
                : `Halaman ${pagination.page} dari ${pagination.totalPages} · ${pagination.total} user`}
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
        <UserFormModal
          user={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
      {shiftEmployee && (
        <EmployeeShiftModal
          employee={shiftEmployee}
          onClose={() => setShiftEmployee(null)}
        />
      )}
    </div>
  );
}
