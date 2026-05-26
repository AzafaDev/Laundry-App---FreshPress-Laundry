"use client";

import { useState } from "react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendanceReport } from "@/hooks/useAttendance";
import { Download, ChevronLeft, ChevronRight, Calendar, Filter, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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

export default function OutletAdminAttendanceReportPage() {
  const { _hasHydrated, user } = useEmployeeAuthStore();
  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }
  const outletId = user?.outlet_id ?? null;

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "" as "" | "on_time" | "late",
    page: 1,
    limit: 10,
  });

  const queryParams = {
    outletId: outletId ?? undefined,
    status: filters.status || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page: filters.page,
    limit: filters.limit,
  };

  const { data, isLoading, isError, refetch } = useAttendanceReport(queryParams);

  const records = data?.data ?? [];
  const pagination = data?.pagination;

  const handleExportCSV = () => {
    if (!records.length) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const headers = ["Nama Karyawan", "Email", "Tanggal", "Check In", "Check Out", "Status"];
    const rows = records.map((att) => [
      att.user?.full_name ?? "-",
      att.user?.email ?? "-",
      format(new Date(att.date), "dd MMM yyyy", { locale: id }),
      att.check_in_time ?? "-",
      att.check_out_time ?? "-",
      STATUS_LABEL[att.status] ?? att.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("CSV berhasil diekspor");
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      page: 1,
      limit: 10,
    });
    toast.success("Filter direset");
  };

  if (!outletId) {
    return (
      <div className="p-8 text-center text-error">
        Anda tidak terdaftar di outlet manapun. Hubungi super admin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Laporan Absensi Karyawan</h2>
        <p className="text-base text-on-surface-variant">
          Lihat dan ekspor data absensi karyawan di outlet Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-5 rounded-xl border border-outline-variant shadow-sm">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, startDate: e.target.value, page: 1 }))
            }
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Mulai tanggal"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: e.target.value, page: 1 }))
            }
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Sampai tanggal"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value as "" | "on_time" | "late", page: 1 }))
            }
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-lg bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
          >
            <option value="">Semua Status</option>
            <option value="on_time">Tepat Waktu</option>
            <option value="late">Terlambat</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetFilters}
            className="flex-1 flex items-center justify-center gap-2 border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg hover:bg-surface-container-low transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!records.length}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-sm font-bold">Nama Karyawan</th>
                <th className="px-6 py-4 text-sm font-bold">Tanggal</th>
                <th className="px-6 py-4 text-sm font-bold">Check In</th>
                <th className="px-6 py-4 text-sm font-bold">Check Out</th>
                <th className="px-6 py-4 text-sm font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-on-surface-variant">Memuat data...</p>
                  </td>
                </tr>
              )}
              {!isLoading && records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    Tidak ada data absensi untuk filter ini.
                  </td>
                </tr>
              )}
              {records.map((att) => (
                <tr key={att.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">{att.user?.full_name ?? "-"}</p>
                    <p className="text-xs text-on-surface-variant">{att.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {format(new Date(att.date), "dd MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-6 py-4 font-mono">{att.check_in_time ?? "-"}</td>
                  <td className="px-6 py-4 font-mono">{att.check_out_time ?? "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLOR[att.status] ?? "bg-surface-container-high text-on-surface-variant"}`}>
                      {STATUS_LABEL[att.status] ?? att.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 flex justify-between items-center border-t border-outline-variant bg-surface-container-lowest">
            <span className="text-sm text-on-surface-variant">
              Halaman {pagination.page} dari {pagination.total_pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-2 rounded border disabled:opacity-30 hover:bg-surface-container-high transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
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
  );
}