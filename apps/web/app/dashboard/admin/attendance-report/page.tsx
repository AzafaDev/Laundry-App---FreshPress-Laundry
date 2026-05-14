"use client";

import Image from "next/image";
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Shirt,
  Download,
  TrendingUp,
  Truck,
  Wrench,
  Search,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useMemo, useState } from "react";
import { AttendanceReportParams } from "@/types/attendance.type";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";

const STATUS_LABEL: Record<string, string> = {
  on_time: "Tepat Waktu",
  late: "Terlambat",
  absent: "Absen",
};

const STATUS_COLOR: Record<string, string> = {
  on_time: "bg-primary/10 text-primary border border-primary/20",
  late: "bg-amber-100 text-amber-700 border border-amber-200",
  absent: "bg-error-container text-on-error-container border border-error/20",
};

const ROLE_LABEL: Record<string, string> = {
  driver: "Driver",
  worker: "Worker",
};

const ROLE_ICON: Record<string, React.ElementType> = {
  driver: Truck,
  worker: Wrench,
};

const ROLE_COLOR: Record<string, string> = {
  driver: "bg-secondary-container/20 text-secondary",
  worker: "bg-primary-container/20 text-primary",
};

export default function AttendanceReportPage() {
  const [filters, setFilters] = useState<AttendanceReportParams>({
    page: 1,
    limit: 10,
  });

  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["attendance", "report", filters],
    queryFn: () => attendanceService.getReport(filters),
  });

  const records = data?.data ?? [];
  const pagination = data?.pagination;

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((a) => a.user?.full_name.toLowerCase().includes(q));
  }, [records, search]);

  const totalPages = pagination?.total_pages ?? 1;
  const currentPage = pagination?.page ?? 1;
  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <span className="hidden md:block text-sm text-on-surface-variant">
          Admin Dashboard
        </span>
        <div className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden" />
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <nav className="space-y-1 px-2 mt-4">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" active />
        </nav>
      </aside>

      <main className="lg:pl-72 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">
              Attendance Report
            </h2>
            <p className="text-base text-on-surface-variant">
              Laporan absensi seluruh staff
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg text-sm hover:opacity-90 active:scale-[0.98] transition-all">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Cari nama staff..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Error state */}
        {isError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 mb-6">
            <p className="text-sm font-bold text-error">Gagal memuat data</p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-xs text-error underline underline-offset-2"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Role
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Clock In
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Clock Out
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-on-surface-variant text-sm"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-on-surface-variant text-sm"
                    >
                      Tidak ada data absensi.
                    </td>
                  </tr>
                ) : (
                  filtered.map((att) => {
                    const RoleIcon = ROLE_ICON[att.user?.role ?? ""] ?? Wrench;
                    return (
                      <tr
                        key={att.id}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-on-surface">
                            {att.user?.full_name ?? "-"}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {att.user?.email ?? "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              ROLE_COLOR[att.user?.role ?? ""] ??
                              "bg-surface-container-low text-on-surface-variant"
                            }`}
                          >
                            {RoleIcon && <RoleIcon className="w-3.5 h-3.5" />}
                            {ROLE_LABEL[att.user?.role ?? ""] ??
                              att.user?.role ??
                              "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(att.attendance_date).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {att.check_in_time ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {att.check_out_time ?? "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              STATUS_COLOR[att.status] ?? ""
                            }`}
                          >
                            {STATUS_LABEL[att.status] ?? att.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="px-6 py-4 bg-surface border-t border-outline-variant flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                Menampilkan halaman {currentPage} dari {totalPages} (
                {pagination.total} data)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      page: Math.max(1, currentPage - 1),
                    }))
                  }
                  className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setFilters((p) => ({ ...p, page: pageNum }))
                      }
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                        pageNum === currentPage
                          ? "bg-primary text-on-primary"
                          : "hover:bg-surface-container-high"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setFilters((p) => ({ ...p, page: currentPage + 1 }))
                  }
                  className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
          : "text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </a>
  );
}
