"use client";

import { Store, BarChart3, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function OutletAdminDashboardPage() {
  const { _hasHydrated, user } = useEmployeeAuthStore();
  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">
          Selamat datang, {user?.full_name ?? "Outlet Admin"}
        </h2>
        <p className="text-base text-on-surface-variant">
          Kelola operasional outlet Anda dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashCard
          href="/dashboard/outlet-admin/orders"
          icon={<ReceiptText className="w-6 h-6 text-primary" />}
          title="Order Management"
          description="Lihat dan kelola semua order di outlet Anda."
        />
        <DashCard
          href="/dashboard/outlet-admin/reports"
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
          title="Reports"
          description="Laporan pendapatan dan performa karyawan."
        />
        <DashCard
          href="/dashboard/outlet-admin/staff"
          icon={<Store className="w-6 h-6 text-primary" />}
          title="Staff Management"
          description="Lihat absensi dan kinerja karyawan."
        />
      </div>
    </>
  );
}

function DashCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block p-5 rounded-2xl bg-surface border border-outline-variant hover:border-primary transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        <h3 className="font-semibold text-on-surface">{title}</h3>
      </div>
      <p className="text-sm text-on-surface-variant">{description}</p>
    </Link>
  );
}
