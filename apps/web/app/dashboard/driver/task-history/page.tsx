"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  ChevronRight,
  Truck,
  ShoppingBasket,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Shirt,
  User,
  Home,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

const taskHistory = [
  {
    id: "#FP-9921",
    customer: "Sarah Jenkins",
    time: "14:20 PM",
    amount: "$45.00",
    type: "Delivery",
    icon: Truck,
    color: "bg-primary-container/10 text-primary",
    badge: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  {
    id: "#FP-9844",
    customer: "Michael Chen",
    time: "11:15 AM",
    amount: "—",
    type: "Pickup",
    icon: ShoppingBasket,
    color: "bg-tertiary-container/10 text-tertiary",
    badge: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
  {
    id: "#FP-9810",
    customer: "Eleanor Vance",
    time: "09:45 AM",
    amount: "$122.50",
    type: "Delivery",
    icon: Truck,
    color: "bg-primary-container/10 text-primary",
    badge: "bg-primary-fixed text-on-primary-fixed-variant",
  },
  {
    id: "#FP-9765",
    customer: "David Miller",
    time: "Yesterday",
    amount: "$28.00",
    type: "Delivery",
    icon: Truck,
    color: "bg-primary-container/10 text-primary",
    badge: "bg-primary-fixed text-on-primary-fixed-variant",
  },
];

export default function DriverTaskHistoryPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      <TopBar />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-on-primary-fixed" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary">Super Admin</p>
            <p className="text-xs text-on-surface-variant">
              admin@freshpress.com
            </p>
          </div>
        </div>
        <nav className="space-y-1 px-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" active />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 p-4 md:p-8 max-w-container-max mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-on-surface mb-2">
            Driver Task History
          </h2>
          <p className="text-base text-on-surface-variant">
            Review your completed pickups and deliveries.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">
                Total Completed
              </p>
              <p className="text-5xl font-bold text-primary">142</p>
            </div>
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">
                Daily Earnings
              </p>
              <p className="text-5xl font-bold text-secondary">$312.50</p>
            </div>
            <div className="w-16 h-16 bg-secondary-fixed rounded-full flex items-center justify-center">
              <BadgeCheck className="w-8 h-8 text-secondary" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant p-2 rounded-lg w-full md:w-72">
            <CalendarDays className="w-5 h-5 text-outline" />
            <input
              className="bg-transparent border-none focus:ring-0 text-base text-on-surface w-full"
              type="text"
              value="Oct 24, 2023 - Today"
              readOnly
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["all", "pickups", "deliveries"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {tab === "all"
                  ? "All Tasks"
                  : tab === "pickups"
                    ? "Pickups"
                    : "Deliveries"}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {taskHistory.map((task, index) => (
            <div
              key={index}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-primary-container/10">
                  <task.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-on-surface-variant">Order ID</p>
                    <p className="text-base font-bold text-on-surface">
                      {task.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Customer</p>
                    <p className="text-base font-bold text-on-surface">
                      {task.customer}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">Time</p>
                    <p className="text-base text-on-surface">{task.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">
                      Amount Collected
                    </p>
                    <p className="text-base font-bold text-primary">
                      {task.amount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-bold ${task.badge}`}
                  >
                    {task.type}
                  </span>
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-2 text-primary font-bold hover:underline py-4">
            <span>Load More Tasks</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// Sidebar link component
const SidebarLink = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
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
