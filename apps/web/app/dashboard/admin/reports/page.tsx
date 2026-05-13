"use client";

import Image from "next/image";
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Shirt,
  TrendingUp,
  CheckCircle,
  Bolt,
  Lightbulb,
  AlertTriangle,
  CalendarDays,
  Download,
  Share2,
  Home,
  User,
  Truck,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const staffData = [
  {
    name: "Sarah Jenkins",
    tasks: 142,
    efficiency: 98,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB17bGu7qBfxxHGkhz2jCNvnLCTX5ZmF2-aaJLcRv8dZ7DtQZgoCji21p45jiCKrSeOfyS6_mW7iRinQFZaiVRAv-bgwhc3THEYe9Z2ail_dKWbmMRCr808vXCBp6RzdWndt1RMt0rs_Vec6BIIBxuDsAi5-FdsfRTNfp4Nfo68-s5l3baePb91a2xRKibfolpeFesk6gP7fjUxB_wF4PNy8T_CB0Y9eek_JVZK1xs-UzujxUDmWGEq7Et-kbWyr2vnEXDFlMmotg8",
  },
  {
    name: "Michael Chen",
    tasks: 128,
    efficiency: 92,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFhQEt2gmY4yxPpDcg_qT4dqFSVu1VaOjAkg_n1HRti7X7Dpl55N5EEwDHaEFE9pYs-E3hRxiqCJvN-qRyTRNfmtM7XQZfQXIl-DIBawK_idt9L_XqGbCKpwirJ0uIIjR_Gw2SYi93qukEODBd_laNw8zu367tg3SgnWG4fZ0FJ3TDhkCdS85QiK3wV3DSTXzZOTJESyMlx23OgUBx5ho0Fus-y76p-nk0fNHCPi-KFXIorE4m2Bzl8gaqAEGP0qUWvQ-nVRp7NMs",
  },
  {
    name: "Elena Rodriguez",
    tasks: 115,
    efficiency: 87,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAqaZ8Q6lzj5wSaaDytiANfdB9aKkgJ1js6XHQkx-6AhUdJq1sRo4CSKWRO16VY_RTj_IBRADAKojhi40LvyRQJTq6zdW7jQ2Xk2gaCZlegJ-L0sbfVPxPIs5EkxM0NyE-Ybzx1SkoI77VVrSzMKsnE8Ej159tYo1sxrpwt1Pk8Y1esYSYem9QP4vj6fHx3vgX39hTGGRiu4A7ZR3U-juvdhw9P7LQqvLAa74XV55Nsg29BYDCWAU1MWUokdcj-dMd2pRu9ZexEfQ",
  },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="hidden md:flex gap-4">
          <button className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded text-sm">
            Support
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded text-sm">
            Documentation
          </button>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvsXvw-0Nll8icx83d1wE_cWLIB-1tIkw8wwlI9MpATef55W4Hdb6BaMjMcE9f-v4CDIgZJJjfxUdN1eePV_PItdtHJNITmSgi0oPXTAEAbWQB4Kh2V0rb4PCHegwFVsr99gVsQ-dcCSN74b_QsQXvDU2gOBqLG7-jeYvpAMg8MDdRSvC2n1dJtpeRPAGWzhJZH0LbeNTySuopywvywF3PE9wy-op0dtwF5qRY4nkOELjECMYQk9c2gRznxSAlDC08kZIjnmsEk-M"
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
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf-IfR6U9l0dpDr0NTIZqxnp0KrnZANBJSZX_YrJs38u4xtaVBDssNYKPbppK71ScHzPh_hhJW7I3oqfmgufTi5puhVizGZQwTeVUsSurlun_U5bTwnTVroL6xdLi6ySwAqelen9JbiiW6Ipgf7snrDcvMU-IztiPkepkZOJjYU03z3oJkfHanJhFOYS53Z3IzsMZL_4AhzBmnlrRwl-_Yt5QZAocavHOldKbMeu4ALJziEwkLMbDJb4lP8QA8FuVmHE1p6OGuKUY"
            alt="Admin"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <p className="text-sm font-bold text-primary">Super Admin</p>
            <p className="text-xs text-on-surface-variant">
              admin@freshpress.com
            </p>
          </div>
        </div>
        <nav className="space-y-1 px-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" active />
        </nav>
      </aside>

      <main className="lg:pl-72 p-4 md:p-8 mb-20 lg:mb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">
              Reports & Analytics
            </h2>
            <p className="text-base text-on-surface-variant">
              Real-time performance metrics and operational insights.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                readOnly
                type="text"
                value="Oct 01 - Oct 31, 2023"
              />
              <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
            </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:opacity-90 transition-all active:scale-[0.98]">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button className="flex items-center gap-1 px-4 py-2 bg-surface-container border border-outline-variant text-on-surface rounded-lg font-medium text-sm hover:bg-surface-container-high transition-all active:scale-[0.98]">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <div className="md:col-span-2 p-8 bg-white border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-on-surface-variant uppercase tracking-wider">
                  Total Revenue
                </p>
                <h3 className="text-5xl font-bold text-on-surface">
                  $42,910.00
                </h3>
              </div>
              <span className="bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                12.5%
              </span>
            </div>
            <div className="w-full h-32 flex items-end gap-1.5 pt-4">
              {[
                "40%",
                "60%",
                "50%",
                "75%",
                "85%",
                "100%",
                "65%",
                "45%",
                "90%",
                "55%",
              ].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/30 rounded-t-sm"
                  style={{ height: h }}
                />
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-4">
              Revenue trends over the last 30 days
            </p>
          </div>

          {/* Completed Orders */}
          <div className="p-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
            <div className="bg-secondary-container w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-on-secondary-container" />
            </div>
            <p className="text-sm text-on-surface-variant">Completed Orders</p>
            <h3 className="text-3xl font-bold text-on-surface">1,402</h3>
            <p className="text-xs text-primary font-bold mt-2">+84 this week</p>
          </div>

          {/* Efficiency Card */}
          <div className="p-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
            <div className="bg-tertiary-fixed w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Bolt className="w-6 h-6 text-on-tertiary-fixed" />
            </div>
            <p className="text-sm text-on-surface-variant">Avg. Turnaround</p>
            <h3 className="text-3xl font-bold text-on-surface">18.4 hrs</h3>
            <p className="text-xs text-error font-bold mt-2">
              -2.1 hrs (Improved)
            </p>
          </div>
        </div>

        {/* Charts & Staff Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Performance Chart */}
          <div className="lg:col-span-2 bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-on-surface">
                Sales Performance
              </h4>
              <select className="bg-surface-container border-none text-sm rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary">
                <option>Monthly</option>
                <option>Daily</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="relative w-full h-80 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between py-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-full border-t border-dashed border-outline-variant"
                  ></div>
                ))}
              </div>
              {/* Simple SVG representation */}
              <svg
                className="w-full h-64 absolute bottom-4"
                preserveAspectRatio="none"
                viewBox="0 0 1000 200"
              >
                <path
                  d="M0,180 Q100,160 200,140 T400,100 T600,60 T800,120 T1000,40"
                  fill="none"
                  stroke="#00685f"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <path
                  d="M0,180 Q100,160 200,140 T400,100 T600,60 T800,120 T1000,40 V200 H0 Z"
                  fill="url(#gradient-primary)"
                  opacity="0.1"
                />
                <defs>
                  <linearGradient
                    id="gradient-primary"
                    x1="0%"
                    x2="0%"
                    y1="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00685f" stopOpacity="1" />
                    <stop offset="100%" stopColor="#00685f" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-between w-full absolute bottom-0 px-2 text-xs text-on-surface-variant">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
              </div>
            </div>
          </div>

          {/* Staff Efficiency */}
          <div className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
            <h4 className="text-xl font-bold text-on-surface mb-6">
              Staff Efficiency
            </h4>
            <div className="space-y-4">
              {staffData.map((staff, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-2 hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  <Image
                    src={staff.avatar}
                    alt={staff.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold">{staff.name}</p>
                      <p className="text-xs text-primary">
                        {staff.efficiency}%
                      </p>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${staff.efficiency}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {staff.tasks} Tasks Completed
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors">
              View All Staff Metrics
            </button>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-outline-variant flex items-center justify-between">
            <h4 className="text-xl font-bold text-on-surface">
              Insight Analysis
            </h4>
            <button className="text-primary text-sm">Refresh Insights</button>
          </div>
          <div className="divide-y divide-outline-variant">
            <div className="p-4 md:p-6 flex items-start gap-4 hover:bg-surface-container-lowest transition-colors">
              <Lightbulb className="w-6 h-6 text-primary mt-1" />
              <div>
                <p className="text-base font-bold text-on-surface">
                  Optimization Opportunity
                </p>
                <p className="text-xs text-on-surface-variant">
                  Staff efficiency on 'Dry Cleaning' tasks peaked between 10 AM
                  and 1 PM. Consider rescheduling specialized tasks to this
                  window for 15% faster turnaround.
                </p>
                <span className="inline-block mt-1 text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  JUST NOW
                </span>
              </div>
            </div>
            <div className="p-4 md:p-6 flex items-start gap-4 hover:bg-surface-container-lowest transition-colors">
              <AlertTriangle className="w-6 h-6 text-tertiary mt-1" />
              <div>
                <p className="text-base font-bold text-on-surface">
                  Inventory Alert
                </p>
                <p className="text-xs text-on-surface-variant">
                  Detergent usage has increased by 22% this week relative to
                  order volume. Recommend audit of dispenser calibration at
                  Downtown Outlet.
                </p>
                <span className="inline-block mt-1 text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                  2 HOURS AGO
                </span>
              </div>
            </div>
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
