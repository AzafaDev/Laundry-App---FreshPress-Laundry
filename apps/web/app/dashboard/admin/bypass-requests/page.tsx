"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bell,
} from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { BypassReviewModal } from "@/components/admin/BypassReviewModal";
import { useSocket } from "@/hooks/useSocket";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BypassRequest {
  id: string;
  order_id: string;
  station: string;
  status: "pending" | "approved" | "rejected";
  discrepancy_description: string;
  expected_items: unknown;
  actual_items: unknown;
  admin_notes: string | null;
  created_at: string;
  order: { id: string; invoice_number: string; outlet: { name: string } };
  requester: { id: string; full_name: string; role: string };
  reviewer: { id: string; full_name: string } | null;
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchBypassRequests = async (
  page: number,
  statusFilter: FilterStatus,
  search: string,
) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    sort_dir: "desc",
  });
  if (statusFilter !== "all") params.set("status", statusFilter);
  const { data } = await axiosInstance.get(`/v1/admin/bypass-requests?${params}`);
  return data;
};

const reviewBypass = async (
  id: string,
  action: "approve" | "reject",
  admin_notes: string,
) => {
  const { data } = await axiosInstance.patch(
    `/v1/admin/bypass-requests/${id}/review`,
    { action, admin_notes },
  );
  return data;
};

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BypassRequest["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error text-xs rounded-full font-medium">
      <XCircle className="w-3.5 h-3.5" />
      Rejected
    </span>
  );
}

const STATION_LABEL: Record<string, string> = {
  washing: "Washing Station",
  ironing: "Ironing Station",
  packing: "Packing Station",
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BypassRequestsPage() {
  const qc = useQueryClient();
  const { on } = useSocket();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BypassRequest | null>(null);
  const [newBadge, setNewBadge] = useState(0);

  // Real-time: bypass requests (badge counter only — toast handled by layout)
  useEffect(() => {
    const unsub = on("bypass:created", () => {
      setNewBadge((n) => n + 1);
    });
    return unsub;
  }, [on]);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin", "bypass-requests", page, statusFilter],
    queryFn: () => fetchBypassRequests(page, statusFilter, search),
    placeholderData: keepPreviousData,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      admin_notes,
    }: {
      id: string;
      action: "approve" | "reject";
      admin_notes: string;
    }) => reviewBypass(id, action, admin_notes),
    onSuccess: (_, vars) => {
      toast.success(
        vars.action === "approve"
          ? "Bypass request disetujui."
          : "Bypass request ditolak.",
      );
      qc.invalidateQueries({ queryKey: ["admin", "bypass-requests"] });
      setSelected(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Terjadi kesalahan.";
      toast.error(msg);
    },
  });

  const items: BypassRequest[] = data?.data ?? [];
  const pagination = data?.pagination;

  // Client-side search filter
  const filtered = search.trim()
    ? items.filter(
        (r) =>
          r.order.invoice_number
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          r.requester.full_name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          r.station.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const handleApprove = (_pin: string, adminNote: string) => {
    if (!selected) return;
    reviewMutation.mutate({ id: selected.id, action: "approve", admin_notes: adminNote });
  };

  const handleReject = (_pin: string, adminNote: string) => {
    if (!selected) return;
    reviewMutation.mutate({ id: selected.id, action: "reject", admin_notes: adminNote });
  };

  // Map to BypassReviewModal format
  const modalData = selected
    ? {
        id: selected.id,
        orderId: selected.order.invoice_number,
        worker: selected.requester.full_name,
        station: STATION_LABEL[selected.station] ?? selected.station,
        expected: Array.isArray(selected.expected_items)
          ? (selected.expected_items as { quantity: number }[]).reduce(
              (s, i) => s + (i.quantity ?? 0),
              0,
            )
          : 0,
        actual: Array.isArray(selected.actual_items)
          ? (selected.actual_items as { quantity: number }[]).reduce(
              (s, i) => s + (i.quantity ?? 0),
              0,
            )
          : 0,
        reason: selected.discrepancy_description,
        status: selected.status,
      }
    : null;

  return (
    <>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Bypass Requests</h2>
          <p className="text-base text-on-surface-variant">
            Review dan approve/reject permintaan bypass dari worker.
          </p>
        </div>
        <button
          onClick={() => {
            qc.invalidateQueries({ queryKey: ["admin", "bypass-requests"] });
            setNewBadge(0);
          }}
          className="relative flex items-center gap-1 px-3 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-high"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
          {newBadge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error text-[10px] font-bold">
              {newBadge > 9 ? "9+" : newBadge}
            </span>
          )}
        </button>
        {newBadge > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-primary-container/20 text-primary rounded-lg text-sm animate-pulse">
            <Bell className="w-4 h-4" />
            {newBadge} request baru
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder="Cari invoice, worker, station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as FilterStatus);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {isError && (
          <p className="p-4 text-sm text-error">
            Gagal memuat data. Coba lagi.
          </p>
        )}

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table
            className={`w-full text-left border-collapse ${isFetching ? "opacity-60" : ""}`}
          >
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 text-sm font-bold">Invoice</th>
                <th className="px-4 py-3 text-sm font-bold">Worker</th>
                <th className="px-4 py-3 text-sm font-bold">Station</th>
                <th className="px-4 py-3 text-sm font-bold">Outlet</th>
                <th className="px-4 py-3 text-sm font-bold text-center">
                  Mismatch
                </th>
                <th className="px-4 py-3 text-sm font-bold">Status</th>
                <th className="px-4 py-3 text-sm font-bold text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.length === 0 && !isFetching ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-on-surface-variant"
                  >
                    Tidak ada bypass request ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const expected = Array.isArray(req.expected_items)
                    ? (req.expected_items as { quantity: number }[]).reduce(
                        (s, i) => s + (i.quantity ?? 0),
                        0,
                      )
                    : "—";
                  const actual = Array.isArray(req.actual_items)
                    ? (req.actual_items as { quantity: number }[]).reduce(
                        (s, i) => s + (i.quantity ?? 0),
                        0,
                      )
                    : "—";
                  const diff =
                    typeof expected === "number" && typeof actual === "number"
                      ? expected - actual
                      : 0;
                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-surface-container-lowest transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-primary text-sm">
                        {req.order.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {req.requester.full_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">
                        {STATION_LABEL[req.station] ?? req.station}
                      </td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">
                        {req.order.outlet.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {diff !== 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-error">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {diff > 0 ? `-${diff}` : `+${Math.abs(diff)}`}
                          </span>
                        ) : (
                          <span className="text-xs text-on-surface-variant">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelected(req)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg"
                          title="Review"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-outline-variant">
          {filtered.map((req) => (
            <div key={req.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-bold text-primary text-sm">
                  {req.order.invoice_number}
                </p>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm">
                {req.requester.full_name} ·{" "}
                {STATION_LABEL[req.station] ?? req.station}
              </p>
              <p className="text-xs text-on-surface-variant line-clamp-2">
                {req.discrepancy_description}
              </p>
              <button
                onClick={() => setSelected(req)}
                className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg text-xs hover:bg-surface-container-high"
              >
                <Eye className="w-3 h-3" /> Review
              </button>
            </div>
          ))}
          {filtered.length === 0 && !isFetching && (
            <p className="p-8 text-center text-sm text-on-surface-variant">
              Tidak ada bypass request.
            </p>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-surface-container-low p-4 flex items-center justify-between border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant">
              {pagination.total} request · Halaman {pagination.page} dari{" "}
              {pagination.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || isFetching}
                className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages || isFetching}
                className="p-1 bg-surface border border-outline-variant rounded-lg disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && modalData && (
        <BypassReviewModal
          request={modalData}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
}
