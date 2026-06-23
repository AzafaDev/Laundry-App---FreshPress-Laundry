"use client";

import { useState } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  BarChart3,
  RefreshCw,
  Store,
  Download,
  Calculator,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { axiosInstance } from "@/lib/axios";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useOutlets } from "@/hooks/useOutlets";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SalesChartPoint {
  period: string;
  income: number;
  order_count: number;
  average_per_order: number;
}

interface SalesSummary {
  total_income: number;
  total_orders: number;
  average_per_order: number;
  average_per_period: number;
  period_count: number;
}

interface EmployeePerf {
  employee_id: string;
  full_name: string;
  role: string;
  outlet: string;
  total_jobs: number;
  job_type: string;
}

type GroupBy = "day" | "month" | "year";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

const fmtRupiahFull = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);

const ROLE_LABEL: Record<string, string> = {
  washing_worker: "Washing",
  ironing_worker: "Ironing",
  packing_worker: "Packing",
  driver: "Driver",
};

// ── API fetchers ──────────────────────────────────────────────────────────────
const fetchSalesReport = async (
  groupBy: GroupBy,
  outletId?: string,
  dateFrom?: string,
  dateTo?: string,
) => {
  const params = new URLSearchParams({ group_by: groupBy });
  if (outletId) params.set("outlet_id", outletId);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  const { data } = await axiosInstance.get(`/v1/reports/sales?${params}`);
  return data?.data as { summary: SalesSummary; chart: SalesChartPoint[] };
};

const fetchEmployeeReport = async (
  outletId?: string,
  dateFrom?: string,
  dateTo?: string,
) => {
  const params = new URLSearchParams();
  if (outletId) params.set("outlet_id", outletId);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  const { data } = await axiosInstance.get(`/v1/reports/employees?${params}`);
  return data?.data as EmployeePerf[];
};

// ── CSV download helper ───────────────────────────────────────────────────────
async function downloadCsvFromApi(url: string, filename: string) {
  const { data } = await axiosInstance.get(url, { responseType: "blob" });
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const user = useEmployeeAuthStore((s) => s.user);
  const isSuper = user?.role === "super_admin";

  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [outletId, setOutletId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [downloadingSales, setDownloadingSales] = useState(false);
  const [downloadingEmp, setDownloadingEmp] = useState(false);

  // Outlets dropdown (super_admin only)
  const { data: outletsData } = useOutlets(
    isSuper ? { limit: 100, is_active: true } : {},
  );
  const outlets = outletsData?.items ?? [];

  const salesQuery = useQuery({
    queryKey: ["reports", "sales", groupBy, outletId, dateFrom, dateTo],
    queryFn: () =>
      fetchSalesReport(
        groupBy,
        outletId || undefined,
        dateFrom || undefined,
        dateTo || undefined,
      ),
  });

  const empQuery = useQuery({
    queryKey: ["reports", "employees", outletId, dateFrom, dateTo],
    queryFn: () =>
      fetchEmployeeReport(
        outletId || undefined,
        dateFrom || undefined,
        dateTo || undefined,
      ),
  });

  const salesData = salesQuery.data;
  const empData = empQuery.data ?? [];
  const chartData = salesData?.chart ?? [];

  const buildParams = () => {
    const p = new URLSearchParams({ group_by: groupBy });
    if (outletId) p.set("outlet_id", outletId);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    return p.toString();
  };

  const handleDownloadSalesCsv = async () => {
    setDownloadingSales(true);
    try {
      await downloadCsvFromApi(
        `/v1/reports/sales/export?${buildParams()}`,
        `sales_report_${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } finally {
      setDownloadingSales(false);
    }
  };

  const handleDownloadEmpCsv = async () => {
    setDownloadingEmp(true);
    try {
      const p = new URLSearchParams();
      if (outletId) p.set("outlet_id", outletId);
      if (dateFrom) p.set("date_from", dateFrom);
      if (dateTo) p.set("date_to", dateTo);
      await downloadCsvFromApi(
        `/v1/reports/employees/export?${p}`,
        `employee_performance_${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } finally {
      setDownloadingEmp(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-base text-on-surface-variant">
            Laporan pendapatan dan performa karyawan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              salesQuery.refetch();
              empQuery.refetch();
            }}
            className="flex items-center gap-1 px-3 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-high"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-surface border border-outline-variant rounded-xl">
        {/* Outlet filter — super_admin only */}
        {isSuper && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-on-surface-variant">
              Outlet
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Semua Outlet</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">
            Group By
          </label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="day">Per Hari</option>
            <option value="month">Per Bulan</option>
            <option value="year">Per Tahun</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">
            Dari
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">
            Sampai
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {(outletId || dateFrom || dateTo) && (
          <div className="flex flex-col gap-1 justify-end">
            <button
              onClick={() => { setOutletId(""); setDateFrom(""); setDateTo(""); }}
              className="px-3 py-2 border border-outline-variant rounded-lg text-sm hover:bg-surface-container-high"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-on-surface-variant">Total Pendapatan</span>
          </div>
          {salesQuery.isLoading ? (
            <div className="h-8 w-32 bg-surface-container-high rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold">{fmtRupiahFull(salesData?.summary.total_income ?? 0)}</p>
          )}
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-secondary-container rounded-lg">
              <ShoppingBag className="w-5 h-5 text-on-secondary-container" />
            </div>
            <span className="text-xs text-on-surface-variant">Total Order Selesai</span>
          </div>
          {salesQuery.isLoading ? (
            <div className="h-8 w-20 bg-surface-container-high rounded animate-pulse" />
          ) : (
            <p className="text-xl font-bold">{salesData?.summary.total_orders ?? 0}</p>
          )}
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calculator className="w-5 h-5 text-amber-700" />
            </div>
            <span className="text-xs text-on-surface-variant">Rata-rata per Order</span>
          </div>
          {salesQuery.isLoading ? (
            <div className="h-8 w-24 bg-surface-container-high rounded animate-pulse" />
          ) : (
            <>
              <p className="text-xl font-bold">{fmtRupiahFull(salesData?.summary.average_per_order ?? 0)}</p>
              <p className="text-xs text-on-surface-variant mt-1">per transaksi selesai</p>
            </>
          )}
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-tertiary-container rounded-lg">
              <LineChartIcon className="w-5 h-5 text-on-tertiary-container" />
            </div>
            <span className="text-xs text-on-surface-variant">
              Rata-rata per {groupBy === "day" ? "Hari" : groupBy === "month" ? "Bulan" : "Tahun"}
            </span>
          </div>
          {salesQuery.isLoading ? (
            <div className="h-8 w-24 bg-surface-container-high rounded animate-pulse" />
          ) : (
            <>
              <p className="text-xl font-bold">{fmtRupiahFull(salesData?.summary.average_per_period ?? 0)}</p>
              <p className="text-xs text-on-surface-variant mt-1">dari {salesData?.summary.period_count ?? 0} periode</p>
            </>
          )}
        </div>
      </div>

      {/* Sales chart */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Laporan Pendapatan</h3>
            <span className="text-xs text-on-surface-variant capitalize">
              · Per {groupBy === "day" ? "Hari" : groupBy === "month" ? "Bulan" : "Tahun"}
            </span>
          </div>
          <button
            onClick={handleDownloadSalesCsv}
            disabled={downloadingSales || salesQuery.isLoading || chartData.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high disabled:opacity-50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingSales ? "Mengunduh..." : "CSV"}
          </button>
        </div>

        {salesQuery.isLoading ? (
          <div className="h-64 bg-surface-container-low rounded-xl animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-on-surface-variant">
            Tidak ada data pendapatan pada periode ini.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11 }}
                stroke="var(--color-outline)"
              />
              <YAxis
                tickFormatter={(v) => fmtRupiah(v)}
                tick={{ fontSize: 11 }}
                stroke="var(--color-outline)"
              />
              <Tooltip
                formatter={(v, name) => {
                  if (name === "income") return [fmtRupiahFull(Number(v ?? 0)), "Pendapatan"];
                  if (name === "average_per_order") return [fmtRupiahFull(Number(v ?? 0)), "Rata-rata/Order"];
                  return [v, name];
                }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--color-outline-variant)",
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="income"
              />
              <Line
                type="monotone"
                dataKey="average_per_order"
                stroke="var(--color-secondary)"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                name="average_per_order"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Employee performance */}
      <div className="bg-surface border border-outline-variant rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Performa Karyawan</h3>
          </div>
          <button
            onClick={handleDownloadEmpCsv}
            disabled={downloadingEmp || empQuery.isLoading || empData.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high disabled:opacity-50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloadingEmp ? "Mengunduh..." : "CSV"}
          </button>
        </div>

        {empQuery.isLoading ? (
          <div className="h-48 bg-surface-container-low rounded-xl animate-pulse" />
        ) : empData.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-8 text-center">
            Belum ada data performa karyawan.
          </p>
        ) : (
          <>
            {/* Bar chart top 10 */}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={empData.slice(0, 10)}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-outline-variant)"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="full_name"
                  tick={{ fontSize: 11 }}
                  width={95}
                />
                <Tooltip
                  formatter={(v) => [v ?? 0, "Total Pekerjaan"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar
                  dataKey="total_jobs"
                  fill="var(--color-primary)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="text-left p-3 font-semibold">Nama</th>
                    <th className="text-left p-3 font-semibold">Role</th>
                    {isSuper && (
                      <th className="text-left p-3 font-semibold">Outlet</th>
                    )}
                    <th className="text-right p-3 font-semibold">
                      Total Pekerjaan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {empData.map((emp) => (
                    <tr
                      key={emp.employee_id}
                      className="hover:bg-surface-container-lowest"
                    >
                      <td className="p-3 font-medium">{emp.full_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-primary-container/20 text-primary text-xs rounded-full font-medium">
                          {ROLE_LABEL[emp.role] ?? emp.role}
                        </span>
                      </td>
                      {isSuper && (
                        <td className="p-3 text-on-surface-variant">
                          {emp.outlet}
                        </td>
                      )}
                      <td className="p-3 text-right font-bold">
                        {emp.total_jobs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
