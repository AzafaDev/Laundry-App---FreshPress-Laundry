"use client";

import { CalendarDays, Plus } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { OutletTable } from "@/components/dashboard/OutletTable";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <TopBar />

      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Good morning, Admin</h2>
              <p className="text-base text-on-surface-variant">
                Here's what's happening across your outlets today.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-dim transition-all">
                <CalendarDays className="w-3.5 h-3.5" />
                Last 7 Days
              </button>
              <button className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.99] transition-all">
                <Plus className="w-3.5 h-3.5" />
                New Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="receipt_long"
              label="Total Orders"
              value="1,284"
              trend={{ direction: "up", value: "12%" }}
            />
            <StatCard
              icon="payments"
              label="Revenue"
              value="$42,920.00"
              trend={{ direction: "up", value: "8.4%" }}
            />
            <StatCard
              icon="storefront"
              label="Active Outlets"
              value="24"
              trend="stable"
            />
            <StatCard
              icon="group"
              label="Staff Active"
              value="86/92"
              trend="online"
            />
          </div>

          {/* Charts & Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WeeklyChart />
            <RecentTransactions />
          </div>

          {/* Outlet Table */}
          <OutletTable />
        </div>
      </main>
    </div>
  );
}
