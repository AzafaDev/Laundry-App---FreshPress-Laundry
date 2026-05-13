"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingUp,
  CheckCircle,
  Circle,
  CalendarDays,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Shirt,
  PlusCircle,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const orders = [
  {
    id: "#FP-9821",
    customer: "James Anderson",
    service: "Wash & Fold • 5kg",
    status: "Washing",
    statusClass: "bg-primary-fixed text-on-primary-fixed",
    role: "Dispatcher",
  },
  {
    id: "#FP-9820",
    customer: "Sarah Jenkins",
    service: "Dry Clean • 2 Items",
    status: "Drying",
    statusClass: "bg-secondary-container text-on-secondary-container",
    role: "Admin",
  },
  {
    id: "#FP-9819",
    customer: "Michael Chen",
    service: "Express • 3kg",
    status: "Ready",
    statusClass: "bg-surface-container-high text-on-surface-variant",
    role: "Store Mgr",
  },
];

const assignmentHistory = [
  {
    name: "David Miller",
    role: "Assigned as Delivery Partner",
    time: "10:48 AM",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCk7vLdmaJCV8Fm8XVWoPu6De2_l_5xG-oS00bsjEEPP0PQ297zq7lhjPV91VgBXhucefD04Pyq1xI1OKj21s5g672KK1N9TjnDg24bTwC1kj0qdpA3rPkG0vib4vh7WIPj6b-uOXCq0TJJS_jxLneq8QCWpD3H2ptqvF2gs1684KMH2rDdPrenuC7CQgbzszUl_8oMkl5wQs_qFUvcYjuXCmhWrlSnMsk6vLXAMWILEHaag4WfM1cO-LRiwK12ciT4LX4IKMxdirE",
  },
  {
    name: "Sarah Kong",
    role: "Quality Check Passed",
    time: "09:30 AM",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDiyNcYCjEnl3bfSQiXtLu3QSKu_3vyyV27dirX3GiV1_DNv8fV54y-ufCzzeU8F1dJeKye391DTUOhNzCcVIFwTDXYFmNtQZfR9MBkqxexkmECzK8nMmZBwk_kfbtdKPBEn9pMAfKpsyaPoQFbkpW2bs-pArnR-tRXDLQEjgKW57Y7S--AXR5jA56FKuW9AySgAulhPzDGJavDZxWTQ4TQ2WrOW1xu66VRqRWmIvSx1QhxXoAbfm3ISFOiYekkcYyzFY-MmbN4Khg",
  },
];

export default function OrderManagementPage() {
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof orders)[number] | null
  >(null);

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/dashboard"
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/admin/orders/manage"
            className="text-primary font-semibold border-b-2 border-primary px-2 py-1"
          >
            Orders
          </Link>
          <Link
            href="/dashboard/admin/outlets"
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded"
          >
            Outlets
          </Link>
        </nav>
        <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border border-outline-variant">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfGQAXV_8gr2IBXSI2lELU9Lz1_ld3jaU_ujwgH40eYsEprooLolJvjYRTUKUGYQucXmJiNBOCas900do6EJrtkG4y0Fxc_ZyVFNnpWb1NKd5Mconfw7fJjiumdN6E8yS9-vMfBF0CiA_wBJylP5h4pTjSO9PINJNCxkoiLA2CqKnshlpuHw-EWd1CTV8zGXbevb1bd_Gnm1i01-ziuyFd-HU33GM5ncuU3Oe3cKFUdY1hGDWxE9OSinj84usN352w5L4v76WkG00"
            alt="Admin avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-on-secondary-container" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Super Admin</p>
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

      <main className="lg:pl-72 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">
              Order Management
            </h2>
            <p className="text-base text-on-surface-variant">
              Monitor and track all active laundry cycles and requests.
            </p>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-md hover:opacity-90 active:scale-95 transition-all">
            <PlusCircle className="w-5 h-5" />
            Create Order from Request
          </button>
        </div>

        {/* Filter Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-surface p-4 rounded-xl border border-outline-variant shadow-sm">
          <FilterField
            icon={Search}
            label="Search Orders"
            placeholder="Order ID or Name"
            type="text"
          />
          <FilterField
            icon={CalendarDays}
            label="Date Range"
            type="select"
            options={["Last 7 Days", "This Month", "Custom Range"]}
          />
          <FilterField
            icon={ListFilter}
            label="Status"
            type="select"
            options={[
              "All Statuses",
              "In Washing",
              "Drying",
              "Ready for Delivery",
            ]}
          />
          <FilterField
            icon={Store}
            label="Outlet"
            type="select"
            options={["All Outlets", "Downtown Branch", "Westside Hub"]}
          />
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order List */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant text-sm border-b border-outline-variant">
                      <th className="px-4 py-4 font-semibold">Order ID</th>
                      <th className="px-4 py-4 font-semibold">Customer</th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                      <th className="px-4 py-4 font-semibold">Role</th>
                      <th className="px-4 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${
                          selectedOrder?.id === order.id
                            ? "bg-surface-container-low border-l-4 border-primary"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-6 text-base font-medium">
                          {order.id}
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex flex-col">
                            <span className="text-base font-semibold">
                              {order.customer}
                            </span>
                            <span className="text-xs text-on-surface-variant">
                              {order.service}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-6">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${order.statusClass}`}
                          >
                            {order.status === "Washing" && (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            {order.status === "Drying" && (
                              <Circle className="w-3.5 h-3.5" />
                            )}
                            {order.status === "Ready" && (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-6 text-sm text-on-surface-variant">
                          {order.role}
                        </td>
                        <td className="px-4 py-6">
                          <Eye
                            className={`w-5 h-5 ${selectedOrder?.id === order.id ? "text-primary" : "text-outline"} hover:text-primary transition-colors`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-4 bg-surface border-t border-outline-variant">
                <span className="text-xs text-on-surface-variant">
                  Showing 1 to 3 of 42 orders
                </span>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary text-xs font-bold">
                    1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low text-xs">
                    2
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low text-xs">
                    3
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Sidebar */}
          <div className="w-full lg:w-1/3">
            {selectedOrder ? (
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col gap-6 sticky top-24">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {selectedOrder.id}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {selectedOrder.customer} • {selectedOrder.service}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${selectedOrder.statusClass}`}
                  >
                    In Transit
                  </span>
                </div>

                {/* Status Tracker */}
                <div className="flex flex-col gap-6 relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-outline-variant"></div>
                  {[
                    {
                      label: "Ready for Pickup",
                      time: "Oct 24, 10:45 AM • Downtown Outlet",
                      done: true,
                      current: true,
                    },
                    {
                      label: "Drying Stage Complete",
                      time: "Oct 24, 09:15 AM • Automated Cycle 4",
                      done: true,
                    },
                    {
                      label: "In Washing",
                      time: "Oct 24, 08:00 AM • Machine #12",
                      done: false,
                    },
                  ].map((step, index) => (
                    <div key={index} className="relative">
                      <div
                        className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full ${step.done ? "bg-primary ring-4 ring-primary-fixed" : "bg-outline-variant"}`}
                      />
                      <div className="flex flex-col">
                        <p
                          className={`text-sm font-bold ${step.done ? "text-on-surface" : "text-on-surface-variant"}`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {step.time}
                        </p>
                        {index === 0 && selectedOrder && (
                          <div className="mt-4 rounded-lg overflow-hidden h-32 border border-outline-variant">
                            <Image
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9WEGbEbX11uI1_5paun47kJCftydBnVsS6CBRAbXlXNcVHKVn5bIwZCeez1wYTq9iLZLPHqBC14lpMrUwNHg4QXmvPBvw0IXNm5vfS17lvXbpS_7kGQfbfxfeZzxTOcv4wjbxgJt9BWW18Fx8R_kxl0ZEbSL0qmaJjzQqohg8wja3u56xfNg1oq0qo3F0pnfaNkAO6Wjaqhua0LIpHaM0d_BIOVJRnY3kQghoaVdr8TPl4gdCUfbgoGnE4YglFFW18ys1-BQ-tbI"
                              alt="Map"
                              width={300}
                              height={128}
                              className="object-cover w-full h-full"
                              sizes="(max-width: 768px) 100vw, 300px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-outline-variant" />

                {/* Assignment History */}
                <div>
                  <h4 className="text-sm font-bold text-on-surface mb-4">
                    Assignment History
                  </h4>
                  <div className="flex flex-col gap-2">
                    {assignmentHistory.map((person, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-2 rounded bg-surface-container-low"
                      >
                        <div className="w-8 h-8 rounded-full bg-outline-variant overflow-hidden">
                          <Image
                            src={person.avatar}
                            alt={person.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold">{person.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {person.role}
                          </p>
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          {person.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full border-2 border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary-container hover:text-on-primary-container transition-all">
                  Update Status
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-8 flex items-center justify-center text-on-surface-variant">
                Select an order to view details
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

const FilterField = ({
  icon: Icon,
  label,
  placeholder,
  type,
  options,
}: {
  icon: React.ElementType;
  label: string;
  placeholder?: string;
  type: "text" | "select";
  options?: string[];
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-on-surface-variant font-semibold">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
      {type === "select" ? (
        <select className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base appearance-none">
          {options?.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-base"
          placeholder={placeholder}
          type="text"
        />
      )}
    </div>
  </div>
);

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
