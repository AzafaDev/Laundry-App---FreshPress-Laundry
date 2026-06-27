"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ShoppingBag, AlertCircle } from "lucide-react";
import { useCustomers } from "@/hooks/useUsers";
import type { CustomerListQuery } from "@/types/user.types";

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "true" | "false">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deleted">("all");

  const query: CustomerListQuery = {
    page,
    limit: 10,
    search: search.trim() || undefined,
    is_verified: verifiedFilter === "all" ? undefined : verifiedFilter === "true",
    include_deleted: statusFilter === "deleted" || undefined,
  };

  const { data, isFetching, isError } = useCustomers(query);

  const allItems = data?.items ?? [];
  const items =
    statusFilter === "deleted"
      ? allItems.filter((c) => !!c.deleted_at)
      : allItems.filter((c) => !c.deleted_at);
  const pagination = data?.pagination;

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <p className="text-base text-on-surface-variant">
          Lihat semua customer yang telah teregistrasi di FreshPress.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama, email, atau nomor telepon..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={verifiedFilter}
          onChange={(e) => { setVerifiedFilter(e.target.value as typeof verifiedFilter); setPage(1); }}
          className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Semua Verifikasi</option>
          <option value="true">Terverifikasi</option>
          <option value="false">Belum Terverifikasi</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
          className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Aktif</option>
          <option value="deleted">Terhapus</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className={`w-full text-sm ${isFetching ? "opacity-60" : ""}`}>
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">Telepon</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Orders</th>
                <th className="text-left px-4 py-3 font-semibold">Komplain</th>
                <th className="text-left px-4 py-3 font-semibold">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-error">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Gagal memuat data customer.
                    </div>
                  </td>
                </tr>
              )}
              {!isError && items.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">
                    Tidak ada customer ditemukan.
                  </td>
                </tr>
              )}
              {items.map((c) => {
                const isDeleted = !!c.deleted_at;
                return (
                  <tr
                    key={c.id}
                    className={`transition-colors ${
                      isDeleted
                        ? "bg-error-container/10 opacity-60"
                        : "hover:bg-surface-container-lowest"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {c.avatar_url ? (
                          <img
                            src={c.avatar_url}
                            alt={c.full_name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className={isDeleted ? "line-through text-on-surface-variant" : ""}>
                          {c.full_name}
                        </span>
                        {isDeleted && (
                          <span className="text-xs text-error">(terhapus)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{c.email}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {c.phone ?? <span className="text-outline italic">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.is_verified ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-tertiary-container text-on-tertiary-container font-medium">
                          Belum Verifikasi
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="font-medium text-on-surface">{c._count.orders}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c._count.complaints > 0 ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-error/10 text-error font-medium">
                          {c._count.complaints}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant text-xs">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">
                      {fmtDate(c.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-outline-variant">
          {items.map((c) => {
            const isDeleted = !!c.deleted_at;
            return (
              <div
                key={c.id}
                className={`p-4 space-y-1 ${isDeleted ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-2">
                  {c.avatar_url ? (
                    <img
                      src={c.avatar_url}
                      alt={c.full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{c.full_name}</p>
                    <p className="text-xs text-on-surface-variant">{c.email}</p>
                  </div>
                  <div className="ml-auto">
                    {c.is_verified ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-tertiary-container text-on-tertiary-container">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-on-surface-variant pt-1">
                  <span>{c.phone ?? "—"}</span>
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> {c._count.orders} order
                  </span>
                  {c._count.complaints > 0 && (
                    <span className="text-error">{c._count.complaints} komplain</span>
                  )}
                  <span className="ml-auto">{fmtDate(c.created_at)}</span>
                </div>
              </div>
            );
          })}
          {items.length === 0 && !isFetching && (
            <p className="p-8 text-center text-sm text-on-surface-variant">
              Tidak ada customer ditemukan.
            </p>
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface-container-low text-sm text-on-surface-variant">
            <span>
              {pagination.total === 0
                ? "0 hasil"
                : `Halaman ${pagination.page} dari ${pagination.totalPages} · ${pagination.total} customer`}
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
    </>
  );
}
