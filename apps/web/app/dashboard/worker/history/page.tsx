"use client";

import Image from "next/image";
import {
  Shirt,
  ClipboardList,
  Star,
  ListFilter,
  CalendarDays,
  Droplets,
  Package,
  CheckCircle,
  LayoutDashboard,
  ReceiptText,
  Store,
  BadgeCheck,
  BarChart3,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const historyData = [
  {
    id: "#FP-92834",
    completed: "14:20 PM",
    type: "Washing",
    typeIcon: Droplets,
    typeColor: "text-primary",
    items: ["8x Shirts", "4x Trousers", "2x Bedding"],
    verified: true,
  },
  {
    id: "#FP-92829",
    completed: "12:15 PM",
    type: "Ironing",
    typeIcon: Shirt,
    typeColor: "text-tertiary",
    items: ["12x Formal Shirts", "1x Blazer"],
    verified: true,
  },
  {
    id: "#FP-92815",
    completed: "11:05 AM",
    type: "Folding",
    typeIcon: Package,
    typeColor: "text-secondary",
    items: ["20x Towels", "5x Bathrobes"],
    verified: true,
  },
];

export default function WorkerHistoryPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="text-primary font-semibold border-b-2 border-primary px-2 py-1"
          >
            Work History
          </a>
        </nav>
        <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPVu6MiYQ6D9vM5l9u3cDHK6ILel3yyDotCxFAqeTC_ht-v41i6rI2UCAjUk2Q-lMsa6X29GQuhW1XDQQqyTu1OGhX4ycRjK_3pt3nm8P_-0muZeRPk7m4fAY_DdEX8wDVN-pITM_5SQwRCnnqumzW94JKwclqPX1UogheyPGcBTR2omAyXsfnQci8Oz_WjWFjnvnt1fqpDNwtI5iMwGn_jdEFRq2C9UY7ou_Q_qz5Gfe16QUAJRO-pmGfMe8pxw049Fq0NrGGF1k"
            alt="Worker avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTqv8g8JecSrw4WLhjwYYRlY6ErHwboPgS3nsAXoq7WG3cNM0IggmmmjU3Ao3N5JfqwpuUl4DU3UibgNQXavpuexJsj2a1kLx-RmQvgYXshfFFHSxFhiwum5Q_nQT0WkaFwEW9vwF18P54IAV3XGuH7o7H12yb8Fq_lqytxr2TSSkJ-BpKYT7y_Pvwhm30hGzhiARrBVoQ7DQHksnd1i3TX1sFu2d6I8T_4Nkc05X7oQRu_-pPNkvYn6-dw8g22Mt3XE-oGDu0bLY"
            alt="Admin"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <span className="text-sm font-bold text-on-surface">John Doe</span>
            <span className="text-xs text-on-surface-variant">Lead Washer</span>
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

      {/* Main */}
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-container-max mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-on-surface mb-6">
              Your Performance Today
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tasks Completed */}
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-container/10 p-2 rounded-lg text-primary">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary-fixed text-on-primary-fixed rounded-full">
                    +12% vs yesterday
                  </span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">
                    Tasks Completed Today
                  </p>
                  <h3 className="text-5xl font-bold text-primary">24</h3>
                </div>
              </div>

              {/* Items Processed */}
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-secondary-container/20 p-2 rounded-lg text-secondary">
                    <Shirt className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">
                    Total Items Processed
                  </p>
                  <h3 className="text-5xl font-bold text-secondary">148</h3>
                </div>
              </div>

              {/* Top Performer */}
              <div className="bg-primary-container p-8 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-center">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Star className="w-[120px] h-[120px]" />
                </div>
                <h4 className="text-on-primary-container text-xl font-bold mb-1">
                  Top Performer!
                </h4>
                <p className="text-on-primary-container/80 text-base">
                  You&apos;re in the top 5% of stations today. Keep up the
                  high-quality flow.
                </p>
                <div className="mt-4 h-2 bg-white/20 rounded-full w-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: "85%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-on-surface">Activity Log</h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-4 py-2 bg-surface-container-high rounded-lg text-sm text-on-surface-variant hover:bg-surface-dim transition-all">
                <ListFilter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-1 px-4 py-2 bg-surface-container-high rounded-lg text-sm text-on-surface-variant hover:bg-surface-dim transition-all">
                <CalendarDays className="w-4 h-4" />
                This Week
              </button>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-4">
            {historyData.map((entry, index) => (
              <div
                key={index}
                className="bg-white border border-outline-variant p-4 md:p-6 rounded-xl flex flex-col md:flex-row gap-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-center md:flex-col justify-center bg-surface-container-low rounded-lg p-4 min-w-[100px] border border-surface-container-high">
                  <entry.typeIcon
                    className={`w-6 h-6 ${entry.typeColor} mb-1`}
                  />
                  <span
                    className={`text-xs uppercase tracking-wider ${entry.typeColor}`}
                  >
                    {entry.type}
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant">
                      Order ID
                    </span>
                    <span className="text-base font-bold text-on-surface">
                      {entry.id}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant">
                      Completed
                    </span>
                    <span className="text-base text-on-surface">
                      {entry.completed}
                    </span>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <span className="text-xs text-on-surface-variant">
                      Items Processed
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.items.map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[11px] rounded-full font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end md:border-l md:pl-6 border-outline-variant">
                  <div className="text-right">
                    <span className="text-xs text-on-surface-variant">
                      Status
                    </span>
                    <p className="text-primary font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 flex justify-center">
            <button className="px-8 py-3 bg-white border border-outline-variant rounded-full text-sm text-primary hover:bg-surface-container-low transition-all">
              Load Older Tasks
            </button>
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
