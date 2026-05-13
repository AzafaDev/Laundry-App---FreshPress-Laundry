"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Check,
  CheckCircle,
  Shirt,
  Truck,
  MapPin,
  BadgeCheck,
  Headphones,
  Info,
  Navigation,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BarChart3,
  Home,
  User,
  MessageSquareWarning,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

// ---------- Sidebar (Desktop) ----------
const Sidebar = () => (
  <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-4 bg-surface-container-low border-r border-outline-variant shadow-sm w-72 pt-20 z-40">
    <div className="mb-6 px-4 flex items-center gap-2">
      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
        JD
      </div>
      <div>
        <p className="text-sm font-bold text-on-surface">John Doe</p>
        <p className="text-xs text-on-surface-variant">Standard Tier</p>
      </div>
    </div>
    <nav className="space-y-1">
      <SidebarLink icon={LayoutDashboard} label="Dashboard" />
      <SidebarLink icon={ReceiptText} label="Orders" active />
      <SidebarLink icon={Package} label="Inventory" />
      <SidebarLink icon={Store} label="Outlets" />
      <SidebarLink icon={BadgeCheck} label="Staff" />
      <SidebarLink icon={BarChart3} label="Reports" />
    </nav>
  </aside>
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
    className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      active
        ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </a>
);

// ---------- Order Detail Page ----------
export default function OrderDetailPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 lg:pb-0">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full">
            <Bell className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHWKYFOh3_XLZQ73MEU9HojFLAYPVt2ef9uw1El-dUdibsp9Bxf6t7MbLfR4yIEWRfhM9if16jjXDBhqJSsKk5rKTKE__yLcaAqLbpj3uOCKNHTXVYVEdLMHisUH0CjvXsA2wJfNAg2FI-Cq2s5cKzMUtJre3L0I8MnPXiF17yj1Bx8w-ggTjKONf5q-BkYqCgcRD7WarYaQQAe3k02g0WJcw3YYpCoxT0k14g8AFxpfvCP_JHkIsDMaRZDH53Zeagjme86Ufd2aQ"
              alt="User avatar"
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="max-w-[672px] mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Order Header */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center text-xs text-on-surface-variant mb-2">
                <span>Orders</span>
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="text-primary font-bold">#ORD-29402</span>
              </nav>
              <h2 className="text-2xl font-bold text-on-surface">
                Order Detail
              </h2>
              <p className="text-base text-on-surface-variant">
                Estimated delivery: Tomorrow, 10:00 AM - 12:00 PM
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-sm font-bold">
                Washing
              </span>
              <span className="bg-surface-container-highest text-on-surface-variant px-4 py-1 rounded-full text-sm font-medium border border-outline-variant">
                Standard Service
              </span>
            </div>
          </section>

          {/* Progress Stepper */}
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              {
                label: "Placed",
                time: "Mon, 08:30 AM",
                active: true,
                done: true,
              },
              {
                label: "Picked Up",
                time: "Mon, 11:15 AM",
                active: true,
                done: true,
              },
              {
                label: "Processing",
                time: "In Progress",
                active: true,
                done: false,
              },
              { label: "Ready", time: "Pending", active: false, done: false },
              {
                label: "Delivered",
                time: "Pending",
                active: false,
                done: false,
              },
            ].map((step, i) => (
              <div
                key={step.label}
                className={`relative flex flex-col items-center p-4 rounded-xl border-l-4 ${
                  step.active
                    ? step.done
                      ? "bg-surface-container-low border-primary shadow-sm"
                      : "bg-surface-container-highest border-secondary-container shadow-sm"
                    : "bg-surface-container-lowest border-outline-variant opacity-60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.done
                      ? "bg-primary text-on-primary"
                      : step.active
                        ? "border-2 border-primary text-primary animate-pulse"
                        : "border-2 border-outline-variant text-outline-variant"
                  }`}
                >
                  {step.done ? (
                    <Check className="w-5 h-5" />
                  ) : step.active ? (
                    <Shirt className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                </div>
                <p
                  className={`text-sm font-bold ${
                    step.active ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {step.time}
                </p>
              </div>
            ))}
          </section>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Summary & Items */}
            <div className="md:col-span-2 space-y-6">
              {/* Item Summary Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                  <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-primary" />
                    Item Summary
                  </h3>
                  <span className="text-sm text-on-surface-variant">
                    6 Items Total
                  </span>
                </div>
                <div className="divide-y divide-outline-variant">
                  {/* Item Row 1 */}
                  <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                        <Shirt className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-on-surface">
                          Cotton Shirts
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Wash & Fold • White
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-on-surface">x 4</p>
                      <p className="text-xs text-primary">$12.00</p>
                    </div>
                  </div>
                  {/* Item Row 2 */}
                  <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
                        <Shirt className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-on-surface">
                          Wool Trousers
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Dry Clean Only • Navy
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-on-surface">x 2</p>
                      <p className="text-xs text-primary">$18.50</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low flex justify-between items-center font-bold">
                  <span className="text-base">Total (Tax Incl.)</span>
                  <span className="text-xl text-primary">$30.50</span>
                </div>
              </div>

              {/* Address Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <MapPin className="w-5 h-5" />
                    <p className="text-sm font-bold uppercase tracking-wider">
                      Pickup Address
                    </p>
                  </div>
                  <p className="text-base font-bold">Home (John Doe)</p>
                  <p className="text-base text-on-surface-variant">
                    123 Fresh Lane, Suite 400
                    <br />
                    Clean City, CC 90210
                  </p>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-secondary">
                    <Truck className="w-5 h-5" />
                    <p className="text-sm font-bold uppercase tracking-wider">
                      Delivery Address
                    </p>
                  </div>
                  <p className="text-base font-bold">Home (John Doe)</p>
                  <p className="text-base text-on-surface-variant">
                    123 Fresh Lane, Suite 400
                    <br />
                    Clean City, CC 90210
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions & Notes */}
            <div className="space-y-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-lg flex flex-col gap-4 sticky top-24">
                <h4 className="text-xl font-bold text-on-surface">
                  Order Action
                </h4>
                <button
                  disabled
                  className="w-full py-4 px-6 bg-surface-container-high text-on-surface-variant font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                >
                  <BadgeCheck className="w-5 h-5" />
                  Confirm Receipt
                </button>
                <p className="text-xs text-center text-on-surface-variant italic">
                  Waiting for delivery to enable confirmation.
                </p>
                <hr className="border-outline-variant" />
                <button className="w-full py-2 px-6 border border-primary text-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all">
                  <Headphones className="w-5 h-5" />
                  Contact Support
                </button>
                <Link
                  href="/dashboard/orders/ORD-29402/complain"
                  className="w-full py-2 px-6 border border-error/30 text-error font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-error/5 transition-all"
                >
                  <MessageSquareWarning className="w-5 h-5" />
                  Buat Komplain
                </Link>
                <div className="bg-tertiary-fixed text-on-tertiary-fixed p-4 rounded-lg flex gap-2">
                  <Info className="w-5 h-5 text-tertiary flex-shrink-0" />
                  <p className="text-xs leading-relaxed">
                    <strong>Note:</strong> Your order will be automatically
                    confirmed 24 hours after delivery is marked complete if no
                    action is taken.
                  </p>
                </div>
                <div className="w-full h-32 rounded-lg overflow-hidden relative border border-outline-variant">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbM-VfJX-9CCGwwukUtnIJq3Oo6TqfBsuKDsnrSKO4nV6rmdbcl9l30F3xlD84ygmgzzp4KqcLhTCVn2kAaJYsH149pWZ-SG0WsNpRwse6A2vZJRj8h-MlgHIArvt8yukWoO3b6wNe4ck_y_Tww7oDhxCYrKj7jrtqGydlnawxdykCuN475fIKBwO5Q7sk_FSD9cWqx2YNt-AxSJ3zp5L6x7dNNRUrF5YNwEsaZPVEf8cystZafttC-1EhWT4RiFc27zqCILErY0U"
                    alt="Delivery route map"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white">
                    <Navigation className="w-4 h-4" />
                    <span className="text-xs">Driver nearby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
