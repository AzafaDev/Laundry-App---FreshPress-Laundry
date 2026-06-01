"use client";

import Link from "next/link";
import { Receipt, Users, CalendarCheck, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function OutletDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">
          Selamat datang, {user?.full_name ?? "Outlet Admin"}
        </h2>
        <p className="text-base text-on-surface-variant">
          Kelola operasional outlet Anda dari sini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashCard
          href="/dashboard/outlet/orders"
          icon={<Receipt className="w-6 h-6 text-primary" />}
          title="Orders"
          description="Buat dan pantau order laundry di outlet Anda."
        />
        <DashCard
          href="/dashboard/outlet/staff"
          icon={<Users className="w-6 h-6 text-primary" />}
          title="Staff"
          description="Lihat worker dan driver yang ditugaskan ke outlet."
        />
        <DashCard
          href="/dashboard/outlet/attendance"
          icon={<CalendarCheck className="w-6 h-6 text-primary" />}
          title="Attendance"
          description="Pantau kehadiran staff outlet."
        />
        <DashCard
          href="/dashboard/outlet/reports"
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
          title="Reports"
          description="Laporan order dan performa outlet."
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
