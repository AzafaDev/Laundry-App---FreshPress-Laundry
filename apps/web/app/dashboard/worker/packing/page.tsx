"use client";

import Image from "next/image";
import {
  Shirt,
  Search,
  ListFilter,
  CheckCircle,
  Printer,
  ClipboardList,
  AlertTriangle,
  Package,
  LayoutDashboard,
  ReceiptText,
  Store,
  BadgeCheck,
  BarChart3,
  Home,
  User,
  Truck,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const orders = [
  {
    id: "#ORD-89241",
    customer: "Sarah Mitchell",
    items: "8 Items (Wash & Fold)",
    status: "ready",
    statusLabel: "Ready for Delivery",
    statusIcon: CheckCircle,
    statusColor: "bg-secondary-container/20 text-on-secondary-container",
    arrived: "Arrived 15m ago",
    delivery: "Express Delivery",
    priority: false,
  },
  {
    id: "#ORD-89245",
    customer: "James Wilson",
    items: "3 Items (Dry Clean Only)",
    status: "payment",
    statusLabel: "Waiting for Payment",
    statusIcon: AlertTriangle,
    statusColor: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    arrived: "Arrived 45m ago",
    delivery: "High Priority Staging",
    priority: true,
  },
  {
    id: "#ORD-89248",
    customer: "Emily Chen",
    items: "12 Items (Bulk Wash)",
    status: "ready",
    statusLabel: "Ready for Delivery",
    statusIcon: CheckCircle,
    statusColor: "bg-secondary-container/20 text-on-secondary-container",
    arrived: "Arrived 1h ago",
    delivery: "Large Box Required",
    priority: false,
  },
];

export default function PackingStationPage() {
  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-4 bg-surface-container-low border-r border-outline-variant w-72 z-50">
        <div className="flex items-center gap-4 mb-6 px-2">
          <Shirt className="text-primary w-8 h-8" />
          <h1 className="text-lg font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <nav className="flex-1 space-y-1">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={Package} label="Orders" active />
          <SidebarLink icon={ReceiptText} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" />
        </nav>
        <div className="mt-auto p-4 bg-surface-container-lowest rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">Super Admin</p>
            <p className="text-xs text-on-surface-variant truncate">
              admin@freshpress.com
            </p>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <Shirt className="text-primary w-6 h-6" />
            <span className="text-xl font-bold text-primary">
              Packing Station
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-primary">
                Station #04
              </span>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                East Wing Facility
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHhirx6ZNglT2FRVFbAo-nr9FW3S9rizfnGj6fE0oR6swGn6W4M0lbgStNU6-cNL1KuWAok_YJ66Jk2Odce_ExLDbuvBcBu__ts2diDlkCcp_9IwYXY9tpBFLLwuObxonGZu13HAU6CzET1_heQHbns2oMHvG7sga3X4g_69Ou5RQ89shmVwIEn3GqZSn5CHkxO1ikauBoknnVJJc0j3pAptp1e_-f3L7ulPQ15dwV7061mTg7e-ybsGwlD096WTLKs_eDSL5hQQo"
                alt="Supervisor"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-container-max mx-auto w-full">
          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 bg-surface-container-low p-6 rounded-xl border border-outline-variant flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                  Today's Goal
                </h2>
                <p className="text-xl font-bold text-on-surface">
                  142 Orders / 200
                </p>
              </div>
              <div className="w-full bg-surface-container-highest h-3 rounded-full mt-4 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "71%" }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-8 h-8 text-tertiary-container mb-1" />
              <p className="text-5xl font-bold text-on-surface">12</p>
              <p className="text-xs text-on-surface-variant">
                Waiting for Packing
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-outline-variant flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-8 h-8 text-primary mb-1" />
              <p className="text-5xl font-bold text-on-surface">84</p>
              <p className="text-xs text-on-surface-variant">Completed Today</p>
            </div>
          </section>

          {/* Queue Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h3 className="text-xl font-bold text-on-surface">
              Active Packing Queue
            </h3>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
                  placeholder="Search Order ID..."
                  type="text"
                />
              </div>
              <button className="flex items-center gap-1 px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-sm font-bold hover:bg-surface-container-highest transition-colors">
                <ListFilter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          {/* Order Cards */}
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-shrink-0 w-16 h-16 bg-surface-container-low rounded-lg flex items-center justify-center text-primary">
                    <Shirt className="w-8 h-8" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold">{order.id}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${order.statusColor}`}
                      >
                        <order.statusIcon className="w-3.5 h-3.5" />
                        {order.statusLabel}
                      </span>
                    </div>
                    <p className="text-base text-on-surface-variant">
                      Customer:{" "}
                      <span className="font-bold text-on-surface">
                        {order.customer}
                      </span>{" "}
                      • {order.items}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <CheckCircle className="w-3.5 h-3.5" /> {order.arrived}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          order.priority
                            ? "text-tertiary font-bold"
                            : "text-on-surface-variant"
                        }`}
                      >
                        {order.priority && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        <Package className="w-3.5 h-3.5" />
                        {order.delivery}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                    <button className="flex-1 md:w-40 flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant rounded-lg text-sm font-bold hover:bg-surface-container-low transition-all">
                      <Printer className="w-5 h-5" /> Print Label
                    </button>
                    <button className="flex-1 md:w-40 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm">
                      <ClipboardList className="w-5 h-5" /> Complete Packing
                    </button>
                  </div>
                </div>
                {/* Progress Stepper */}
                <div className="px-4 md:px-6 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="h-[2px] bg-primary flex-1" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="h-[2px] bg-primary flex-1" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="h-[2px] bg-outline-variant flex-1" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-outline-variant" />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] uppercase font-bold text-on-surface-variant">
                    <span>Received</span>
                    <span>Washing</span>
                    <span className="text-primary">Packing</span>
                    <span>Delivery</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

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
