"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  MessageSquareWarning,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useOutlets } from "@/hooks/useOutlets";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { ComplaintDetailModal } from "@/components/admin/ComplaintDetailModal";

// -- Types --------------------------------------------------------------------
import type { Complaint } from "@/types/order.types";

interface ComplaintStats {
  open: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

interface ListResponse {
  data: {
    items: Complaint[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

type FilterStatus = "all" | "open" | "in_progress" | "resolved" | "rejected";

// -- Helpers ------------------------------------------------------------------
const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  missing_item: "Item Hilang",
  damaged_item: "Item Rusak",
  wrong_item: "Item Tertukar",
  late_delivery: "Pengantaran Terlambat",
  quality_issue: "Kualitas Kurang Baik",
  other: "Lainnya",
};

function StatusBadge({ status }: { status: Complaint["status"] }) {
  const cfg: Record<Complaint["status"], { cls: string; label: string }> = {
    open: { cls: "bg-amber-100 text-amber-700", label: "Open" },
    in_progress: { cls: "bg-blue-100 text-blue-700", label: "Dalam Proses" },
    resolved: { cls: "bg-emerald-100 text-emerald-700", label: "Selesai" },
    rejected: { cls: "bg-red-100 text-red-700", label: "Ditolak" },
  };
  const { cls, label } = cfg[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

// -- Page ---------------------------------------------------------------------
export default function ComplaintsPage() {
  const queryClient = useQueryClient();
  const user = useEmployeeAuthStore((s) => s.user);
  const isSuper = user?.role === "super_admin";

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [outletId, setOutletId] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Outlets for super_admin filter
  const { data: outletsData } = useOutlets(
    isSuper ? { limit: 100, is_active: true } : undefined,
  );
  const outlets = outletsData?.items ?? [];

  // Stats
  const { data: statsData } = useQuery<{ data: ComplaintStats }>({
    queryKey: ["admin", "complaints", "stats", outletId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (outletId) params.set("outlet_id", outletId);
      const { data } = await axiosInstance.get(`/v1/admin/complaints/stats?${params}`);
      return data;
    },
    staleTime: 30_000,
  });
  const stats = statsData?.data;

  // List
  const { data, isFetching } = useQuery<ListResponse>({
    queryKey: ["admin", "complaints", filterStatus, search, page, outletId],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (search) params.set("search", search);
      if (outletId) params.set("outlet_id", outletId);
      const { data } = await axiosInstance.get(`/v1/admin/complaints?${params}`);
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const complaints = data?.data?.items ?? [];
  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleFilterStatus(s: FilterStatus) {
    setFilterStatus(s);
    setPage(1);
  }

  function handleOutletChange(id: string) {
    setOutletId(id);
    setPage(1);
  }

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "complaints"] });
  }

  function handleModalClose() {
    setSelectedComplaint(null);
    refresh();
  }

  const STAT_CARDS = [
    { key: "open" as const, label: "Open", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    { key: "in_progress" as const, label: "Dalam Proses", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    { key: "resolved" as const, label: "Selesai", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
    { key: "rejected" as const, label: "Ditolak", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  ];

  const FILTER_OPTS: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "Dalam Proses" },
    { value: "resolved", label: "Selesai" },
    { value: "rejected", label: "Ditolak" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MessageSquareWarning className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Manajemen Komplain</h1>
            <p className="text-sm text-on-surface-variant">Tangani dan pantau komplain pelanggan</p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Outlet filter (super_admin only) */}
      {isSuper && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-on-surface-variant shrink-0">Filter Outlet:</label>
          <select
            value={outletId}
            onChange={(e) => handleOutletChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[200px]"
          >
            <option value="">Semua Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <button
            key={card.key}
            onClick={() => handleFilterStatus(card.key)}
            className={`p-4 rounded-2xl border text-left transition-all hover:shadow-md ${card.bg} ${
              filterStatus === card.key ? "ring-2 ring-primary shadow-md" : ""
            }`}
          >
            <p className={`text-3xl font-bold ${card.text}`}>{stats?.[card.key] ?? "\u2014"}</p>
            <p className={`text-sm font-medium mt-1 ${card.text}`}>{card.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterStatus(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterStatus === opt.value
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Cari invoice, nama customer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-outline-variant bg-surface text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-all"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Customer</th>
                {isSuper && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Outlet</th>
                )}
                <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tipe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Tanggal Masuk</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={isSuper ? 7 : 6} className="py-16 text-center text-on-surface-variant">
                    <MessageSquareWarning className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada komplain ditemukan</p>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                      #{c.order.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{c.customer.full_name}</p>
                      <p className="text-xs text-on-surface-variant">{c.customer.email}</p>
                    </td>
                    {isSuper && (
                      <td className="px-4 py-3 text-on-surface-variant text-xs">
                        {c.order.outlet?.name ?? "\u2014"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-on-surface">
                      {COMPLAINT_TYPE_LABELS[c.complaint_type] ?? c.complaint_type}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(c.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-outline-variant flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Halaman {page} dari {totalPages} ({data?.data?.pagination?.total ?? 0} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
