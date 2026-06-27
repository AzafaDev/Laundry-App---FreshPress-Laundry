"use client";

import Link from "next/link";
import {
  Users,
  Store,
  BarChart3,
  Clock,
  ShoppingBag,
  Receipt,
  ShieldAlert,
  CalendarCheck,
  PlayCircle,
  Shirt,
  UserCircle,
} from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function AdminDashboardPage() {
  const user = useEmployeeAuthStore((s) => s.user);
  const isSuper = user?.role === "super_admin";
  const isOutletAdmin = user?.role === "outlet_admin";

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
        {/* Super admin only */}
        {isSuper && (
          <DashCard
            href="/dashboard/admin/users"
            icon={<Users className="w-6 h-6 text-primary" />}
            title="User Management"
            description="Kelola outlet admin, worker, driver, dan semua user."
          />
        )}
        {isSuper && (
          <DashCard
            href="/dashboard/admin/outlets"
            icon={<Store className="w-6 h-6 text-primary" />}
            title="Outlet Management"
            description="Daftar outlet, koordinat lokasi, dan radius layanan."
          />
        )}
        {isSuper && (
          <DashCard
            href="/dashboard/admin/laundry-items"
            icon={<ShoppingBag className="w-6 h-6 text-primary" />}
            title="Laundry Item Management"
            description="Master data item laundry: nama, satuan, dan harga dasar."
          />
        )}
        {isSuper && (
          <DashCard
            href="/dashboard/admin/clothing-types"
            icon={<Shirt className="w-6 h-6 text-primary" />}
            title="Clothing Types"
            description="Master data jenis pakaian untuk rincian order kiloan."
          />
        )}
        {isSuper && (
          <DashCard
            href="/dashboard/admin/shifts"
            icon={<Clock className="w-6 h-6 text-primary" />}
            title="Work Shifts"
            description="Kelola jadwal shift dan penugasan karyawan per outlet."
          />
        )}
        {isSuper && (
          <DashCard
            href="/dashboard/admin/customers"
            icon={<UserCircle className="w-6 h-6 text-primary" />}
            title="Customer Management"
            description="Lihat semua customer yang teregistrasi di FreshPress."
          />
        )}

        {/* Shared */}
        <DashCard
          href="/dashboard/admin/orders"
          icon={<Receipt className="w-6 h-6 text-primary" />}
          title="Orders"
          description="Lihat semua pesanan dan lacak status order."
        />

        {/* Outlet admin only */}
        {isOutletAdmin && (
          <DashCard
            href="/dashboard/admin/orders/create"
            icon={<PlayCircle className="w-6 h-6 text-primary" />}
            title="Proses Order Masuk"
            description="Order yang telah tiba di outlet dan menunggu diproses."
          />
        )}
        {isOutletAdmin && (
          <DashCard
            href="/dashboard/admin/bypass-requests"
            icon={<ShieldAlert className="w-6 h-6 text-primary" />}
            title="Bypass Requests"
            description="Review dan approve/reject permintaan bypass dari worker."
          />
        )}
        {isOutletAdmin && (
          <DashCard
            href="/dashboard/admin/attendance-report"
            icon={<CalendarCheck className="w-6 h-6 text-primary" />}
            title="Attendance Report"
            description="Pantau absensi harian karyawan di outlet Anda."
          />
        )}

        {/* Shared reports */}
        <DashCard
          href="/dashboard/admin/reports"
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
          title="Reports"
          description="Laporan pendapatan dan performa karyawan."
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
      className="block p-5 rounded-2xl bg-surface border border-outline-variant hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
        <h3 className="font-semibold text-on-surface">{title}</h3>
      </div>
      <p className="text-sm text-on-surface-variant">{description}</p>
    </Link>
  );
}
