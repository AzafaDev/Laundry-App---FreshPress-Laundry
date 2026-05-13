"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Shirt,
  Truck,
  ArrowRight,
  ExternalLink,
  FileText,
  Edit,
  X,
  Plus,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Home,
  User,
  MapIcon,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

// ---------- Helper Icon Wrapper ----------
const IconSpan = ({ children }: { children: React.ReactNode }) => (
  <span className="text-on-surface-variant">{children}</span>
);

// ---------- Sidebar Link Component ----------
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

// ---------- Order Card Component ----------
interface OrderCardProps {
  orderId: string;
  title: string;
  status: "ready" | "in-process" | "completed" | "pickup";
  price: string;
  icon: React.ElementType;
  dateLabel: string;
  dateValue: string;
  showProgress?: boolean;
  progress?: number;
  priority?: boolean;
  address?: string;
}

const statusConfig: Record<
  OrderCardProps["status"],
  { bg: string; text: string; icon: React.ElementType; label: string }
> = {
  ready: {
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
    icon: Truck,
    label: "Ready for Delivery",
  },
  "in-process": {
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
    icon: Shirt,
    label: "In Process",
  },
  completed: {
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed-variant",
    icon: BadgeCheck,
    label: "Completed",
  },
  pickup: {
    bg: "bg-primary-container",
    text: "text-white",
    icon: Truck,
    label: "Pickup Scheduled",
  },
};

const OrderCard = ({
  orderId,
  title,
  status,
  price,
  icon: IconComp,
  dateLabel,
  dateValue,
  showProgress,
  progress,
  priority,
  address,
}: OrderCardProps) => {
  const statusCfg = statusConfig[status];
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-all group relative">
      {priority && (
        <div className="absolute top-0 right-0 p-6">
          <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
            Priority
          </span>
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-primary bg-primary-fixed-dim/20 px-2 py-1 rounded uppercase tracking-tighter">
            {orderId}
          </span>
          <h3 className="text-xl font-bold mt-1">{title}</h3>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusCfg.bg} ${statusCfg.text}`}
          >
            {<statusCfg.icon className="w-4 h-4" />}
            {statusCfg.label}
          </span>
          <p className="text-base font-bold text-on-surface mt-2">{price}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4 border-y border-outline-variant/30 mb-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
          <IconComp className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-on-surface-variant">{dateLabel}</p>
          <p className="text-base font-semibold">{dateValue}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {showProgress && progress !== undefined ? (
          <div className="w-2/3 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <div>
            {address && (
              <div className="flex items-center gap-1 text-on-surface-variant">
                <MapIcon className="w-4 h-4" />
                <span className="text-xs">{address}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {status === "completed" && (
            <button className="text-on-surface-variant text-sm font-bold flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Invoice
            </button>
          )}
          {status === "pickup" && (
            <>
              <button className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1 text-error hover:bg-error-container rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {status === "ready" && (
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View Tracking <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {status === "in-process" && (
            <button className="text-primary text-sm font-bold">
              Order Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Need a MapPin icon for address; we'll import MapPin.
import { MapPin } from "lucide-react";

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 lg:pb-0">
      {/* ---------- Top App Bar ---------- */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-4">
            <Link
              href="#"
              className="text-sm text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded"
            >
              Home
            </Link>
            <Link
              href="#"
              className="text-sm font-semibold text-primary border-b-2 border-primary px-2 py-1"
            >
              Orders
            </Link>
            <Link
              href="#"
              className="text-sm text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded"
            >
              Profile
            </Link>
          </nav>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuvyHp4h9mmpMG1xp9yOmGNDPEhM9LG1u9le1xMGKBRTFm6mCaEikM59eghedwc3nFJHBvhiR6n2x0p264fDsAtnU0jRz1qCPHnxaCZf61HZ3VO43IPcEikh64mzVDmBWkuLCY4LFTs6ivtpqknCAK8rmmXoljv7uz2Vfes6u-c4JZHZrAIZ-hewughvpG9rYfSvlNwyUHbvHZEic1VRSAbXF5SsgXJc1i1c2HJGHOarXEE5wbQ2PDeE9FVYSz9DkggRsS8cZdQ_A"
              alt="User avatar"
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      {/* ---------- Desktop Sidebar ---------- */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtc3fyGnK3GGqJSicZ3PrSJzyWpZCCLm-y0mQYMBVABNhejsT6559IVcmGyZNVMjJaXTM5mxyr7Qf2bFnU5Yp8MHEUbGI9BDr8usxlX58_bxDC92bMRDpAuRwFAVCTHlBdFagTvfnHINULzYTqFCpmNQzSLf7Q1n6pkQmvTro82DbIo9V0hNU4wQdrGk4DDxSo04J6HRXly38FA0I_-P8vReH_xFTmwpbxu0ovluBmaVKbCOpd1_9R6NTSFR0nVfAGyOoht_gRb7I"
              alt="Admin user"
              width={48}
              height={48}
              className="object-cover rounded-full"
            />
          </div>
          <div>
            <p className="text-base font-bold text-primary">Super Admin</p>
            <p className="text-xs text-on-surface-variant">
              admin@freshpress.com
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" active />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" />
        </nav>
      </aside>

      {/* ---------- Main Content ---------- */}
      <main className="lg:pl-72">
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-6">
          {/* Header & Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-3xl font-bold text-on-surface">
                Order History
              </h2>
              <p className="text-base text-on-surface-variant">
                Manage and track your active laundry services or review past
                completions.
              </p>
              {/* Search & Tabs */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base"
                    placeholder="Search Order ID or Service..."
                    type="text"
                  />
                </div>
                <div className="flex bg-surface-container-low p-1 rounded-xl w-full sm:w-auto">
                  <button className="px-4 py-1 rounded-lg text-sm bg-white shadow-sm text-primary font-bold">
                    All
                  </button>
                  <button className="px-4 py-1 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    Active
                  </button>
                  <button className="px-4 py-1 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    Completed
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-primary text-white p-6 rounded-xl flex flex-col justify-between shadow-lg">
              <div className="flex justify-between items-start">
                <TrendingUp className="w-10 h-10" />
                <span className="text-xs bg-primary-container/20 px-2 py-1 rounded-full">
                  This Month
                </span>
              </div>
              <div>
                <p className="text-4xl font-bold">12</p>
                <p className="text-sm opacity-90 uppercase tracking-wider mt-1">
                  Total Active Orders
                </p>
              </div>
            </div>
          </div>

          {/* Order Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <OrderCard
              orderId="#FP-98231"
              title="Premium Wash & Fold"
              status="ready"
              price="$42.50"
              icon={Shirt}
              dateLabel="Scheduled Date"
              dateValue="Oct 24, 2023 · 10:00 AM"
            />
            <OrderCard
              orderId="#FP-98245"
              title="Curtains & Linen"
              status="in-process"
              price="$28.00"
              icon={Shirt}
              dateLabel="Scheduled Date"
              dateValue="Oct 25, 2023 · 02:30 PM"
              showProgress
              progress={50}
            />
            <OrderCard
              orderId="#FP-97102"
              title="Standard Express"
              status="completed"
              price="$19.99"
              icon={Shirt}
              dateLabel="Delivered On"
              dateValue="Oct 20, 2023"
            />
            <OrderCard
              orderId="#FP-98288"
              title="Dry Cleaning"
              status="pickup"
              price="$55.00"
              icon={Shirt}
              dateLabel="Pickup Window"
              dateValue="Tomorrow · 08:00 AM - 10:00 AM"
              priority
              address="Home (Default)"
            />
          </div>

          {/* Subscribe Banner */}
          <section className="mt-12 rounded-2xl overflow-hidden relative h-64 flex items-center p-6 group">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYf-LnETvSzIw-sU9kugI5Mw9VKrv-Px1r004U4LuPQ6V-Hk_yKY1cyG_cmHcP-V41zylGLu67dRGR8Xs72g9bsXmWX9n0kKpB0ojE72isc3GYZQSawwBaMv4XDmRuphYt2v50_i9P086rOWM0CcZXiiSGwFKTJQi51Jx-NsROQ62Y_kwGcn2i5JicJzZM0HoQYRPssXEhMsO5HNOVeNjUneY-WGyPuvcMLFadyFEQIVXdICGjElX_regUNHtCTkNn7cgGYD48oUc"
              alt="Laundry"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
            <div className="relative z-10 max-w-md text-white">
              <h3 className="text-3xl font-bold mb-2">Subscribe & Save</h3>
              <p className="text-base opacity-90 mb-4">
                Get 15% off every order when you switch to our weekly FreshPress
                plan. Never worry about laundry day again.
              </p>
              <button className="bg-white text-primary font-bold px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors">
                Learn More
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* ---------- Mobile Bottom Navigation ---------- */}
      <BottomNav />

      {/* ---------- Floating Action Button ---------- */}
      <button className="fixed right-6 bottom-24 lg:bottom-8 lg:right-8 bg-primary-container text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 flex items-center gap-2">
        <Plus className="w-6 h-6" />
        <span className="hidden md:inline font-bold">New Order</span>
      </button>
    </div>
  );
}
