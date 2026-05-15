"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Loader2,
} from "lucide-react";

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

// Mock data untuk outlet & user (nanti ganti dengan API)
const outletOptions = [
  { id: "", name: "Semua Outlet" },
  { id: "seed-outlet-01", name: "Downtown Hub" },
];
const userOptions = [
  { id: "", name: "Semua User" },
  { id: "driver-id", name: "Test Driver" },
  { id: "worker-id", name: "Test Worker" },
];

export default function AttendanceReportPage() {
  const [filters, setFilters] = useState({
    outletId: undefined as string | undefined,
    userId: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    page: 1,
    limit: 10,
  });

  // Ketika mengirim ke API, filter out undefined values
  const queryParams = {
    page: filters.page,
    limit: filters.limit,
    ...(filters.outletId && { outletId: filters.outletId }),
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
  };

  // Di useQuery, panggil dengan queryParams
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["attendance", "report", filters],
    queryFn: () => attendanceService.getReport(queryParams),
  });

  const records = data?.data ?? [];
  const pagination = data?.pagination;

  const handleExportCSV = () => {
    if (!records.length) return;
    const headers = [
      "Nama",
      "Role",
      "Tanggal",
      "Check In",
      "Check Out",
      "Status",
    ];
    const rows = records.map((att) => [
      att.user?.full_name ?? "-",
      att.user?.role ?? "-",
      new Date(att.attendance_date).toLocaleDateString("id-ID"),
      att.check_in_time ?? "-",
      att.check_out_time ?? "-",
      STATUS_LABEL[att.status] ?? att.status,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${new Date().toISOString().slice(0, 19)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <TopBar />
      <Sidebar />
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">
                Laporan Absensi
              </h2>
              <p className="text-on-surface-variant">
                Lihat dan export data absensi karyawan
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={!records.length}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-surface p-4 rounded-xl border border-outline-variant shadow-sm">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <select
                value={filters.outletId}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    outletId: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary"
              >
                {outletOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <select
                value={filters.userId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, userId: e.target.value, page: 1 }))
                }
                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary"
              >
                {userOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    startDate: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    endDate: e.target.value,
                    page: 1,
                  }))
                }
                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-surface"
              />
            </div>
          </div>

          {/* Tabel */}
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold">Nama</th>
                    <th className="px-6 py-4 text-sm font-bold">Role</th>
                    <th className="px-6 py-4 text-sm font-bold">Tanggal</th>
                    <th className="px-6 py-4 text-sm font-bold">Check In</th>
                    <th className="px-6 py-4 text-sm font-bold">Check Out</th>
                    <th className="px-6 py-4 text-sm font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-on-surface-variant">
                          Memuat data...
                        </p>
                      </td>
                    </tr>
                  )}
                  {!isLoading && records.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-on-surface-variant"
                      >
                        Tidak ada data absensi untuk filter ini.
                      </td>
                    </tr>
                  )}
                  {records.map((att) => (
                    <tr
                      key={att.id}
                      className="border-b border-outline-variant hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold">
                          {att.user?.full_name ?? "-"}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {att.user?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4 capitalize">{att.user?.role}</td>
                      <td className="px-6 py-4">
                        {new Date(att.attendance_date).toLocaleDateString(
                          "id-ID",
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {att.check_in_time ?? "-"}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {att.check_out_time ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[att.status]}`}
                        >
                          {STATUS_LABEL[att.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="px-6 py-4 flex justify-between items-center border-t border-outline-variant bg-surface-container-lowest">
                <span className="text-sm text-on-surface-variant">
                  Halaman {pagination.page} dari {pagination.total_pages} (total{" "}
                  {pagination.total} data)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, page: f.page - 1 }))
                    }
                    disabled={pagination.page <= 1}
                    className="p-2 rounded border disabled:opacity-30 hover:bg-surface-container-high transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, page: f.page + 1 }))
                    }
                    disabled={pagination.page >= pagination.total_pages}
                    className="p-2 rounded border disabled:opacity-30 hover:bg-surface-container-high transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
