"use client";

import Link from "next/link";
import { Users, Store, BarChart3, Clock } from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function AdminDashboardPage() {
  const user = useEmployeeAuthStore((s) => s.user);
  const isSuper = user?.role === "super_admin";

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">
          Selamat datang, {user?.full_name ?? "Admin"}
        </h2>
        <p className="text-base text-on-surface-variant">
          Kelola operasional FreshPress dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isSuper && (
          <DashCard
            href="/dashboard/admin/users"
            icon={<Users className="w-6 h-6 text-primary" />}
            title="User Management"
            description="Kelola super admin, outlet admin, worker, driver, dan customer."
          />
        )}
        <DashCard
          href="/dashboard/admin/outlets"
          icon={<Store className="w-6 h-6 text-primary" />}
          title="Outlets"
          description="Daftar outlet, koordinat, dan radius layanan."
        />
        {isSuper && (
          <DashCard
            href="/dashboard/admin/shifts"
            icon={<Clock className="w-6 h-6 text-primary" />}
            title="Work Shifts"
            description="Kelola jadwal shift dan penugasan karyawan per outlet."
          />
        )}
        <DashCard
          href="/dashboard/admin/reports"
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
          title="Reports"
          description="Laporan kehadiran, order, dan revenue."
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
