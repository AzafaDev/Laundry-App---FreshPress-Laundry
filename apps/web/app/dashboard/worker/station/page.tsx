"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Shirt,
  Check,
  Minus,
  Plus,
  AlertTriangle,
  LockKeyhole,
  X,
  ShieldAlert,
  ChevronRight,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Home,
  User,
  Truck,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { ShiftBadge } from "@/components/ui/ShiftBadge";

// ---------- Desktop Sidebar ----------
const WorkerSidebar = () => (
  <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
    <div className="flex items-center gap-4 p-4 mb-4">
      <Image
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTqv8g8JecSrw4WLhjwYYRlY6ErHwboPgS3nsAXoq7WG3cNM0IggmmmjU3Ao3N5JfqwpuUl4DU3UibgNQXavpuexJsj2a1kLx-RmQvgYXshfFFHSxFhiwum5Q_nQT0WkaFwEW9vwF18P54IAV3XGuH7o7H12yb8Fq_lqytxr2TSSkJ-BpKYT7y_Pvwhm30hGzhiARrBVoQ7DQHksnd1i3TX1sFu2d6I8T_4Nkc05X7oQRu_-pPNkvYn6-dw8g22Mt3XE-oGDu0bLY"
        alt="Admin user"
        width={48}
        height={48}
        className="rounded-full border-2 border-primary"
      />
      <div>
        <span className="text-sm font-bold text-on-surface">Super Admin</span>
        <span className="text-xs text-on-surface-variant">
          admin@freshpress.com
        </span>
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

// ---------- Garment Item Interface ----------
interface GarmentItem {
  id: number;
  name: string;
  sub: string;
  icon: React.ElementType;
  expected: number;
  received: number;
  mismatch: boolean;
}

// ---------- Page Component ----------
export default function WorkerStationPage() {
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [items, setItems] = useState<GarmentItem[]>([
    {
      id: 1,
      name: "T-shirts (White)",
      sub: "Standard Wash & Fold",
      icon: Shirt,
      expected: 12,
      received: 12,
      mismatch: false,
    },
    {
      id: 2,
      name: "Denim Jeans",
      sub: "Heavy Duty Cycle",
      icon: Shirt,
      expected: 5,
      received: 4,
      mismatch: true,
    },
    {
      id: 3,
      name: "Formal Shirts",
      sub: "Press & Steam",
      icon: Shirt,
      expected: 8,
      received: 8,
      mismatch: false,
    },
  ]);

  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = Array.from({ length: 4 }, () =>
    useRef<HTMLInputElement>(null),
  );

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              received: Math.max(0, item.received + delta),
              mismatch: false,
            }
          : item,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
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
            Home
          </a>
          <a
            href="#"
            className="text-primary font-semibold border-b-2 border-primary px-2 py-1"
          >
            Orders
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded"
          >
            Pickup
          </a>
        </nav>
        <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border border-outline-variant">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgRSlM11gQJ-afFFrIL7fUxQzxOjmCaRP-Q9xufe1YYiOdAzi6PL6qA8g7g1QOQcPqdqu3ZYNHzJ5tr9FUywuDjgpcTm1h7povJuYZMSeKQ4kKeseghEhH8zCb86H48NeLs6sVCkb-6P9FQB2ueUgqJhUPWVU_7yt_kPCqLCbcPhu1laAC7C3lY5KFKY30XeG_ChcMku7ShUhcFa4vh6BMN4yL5A-Q-EhqVS4S8kV_7UVRLhxDBmtjAUW2CfXQuoHLLX-fPkbk5pc"
            alt="Worker avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      <WorkerSidebar />

      <main className="lg:pl-72 p-4 md:p-8 space-y-6">
        {/* Order Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-primary-container text-on-primary-container text-xs rounded-full font-bold">
                ACTIVE
              </span>
              <h2 className="text-xl font-bold text-on-surface">
                Order #ORD-5521
              </h2>
            </div>
            <p className="text-base text-on-surface-variant flex items-center gap-1">
              <Shirt className="w-4 h-4" />
              Station:{" "}
              <span className="font-bold text-primary">Washing Station 04</span>
            </p>
            <div className="mt-2">
              <ShiftBadge shift="Afternoon" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-on-surface-variant">Worker Assigned</p>
              <p className="text-sm font-bold">John Marcus</p>
            </div>
            <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2">
              <Check className="w-5 h-5" />
              Finish Task
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Garment Checklist */}
          <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Shirt className="w-5 h-5" /> Garment Checklist
              </h3>
              <span className="text-sm text-on-surface-variant">
                Items: {items.length} Total
              </span>
            </div>
            <div className="divide-y divide-outline-variant">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-surface-container-low transition-colors ${
                    item.mismatch ? "bg-error-container/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-on-surface">
                        {item.name}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-xs text-on-surface-variant block">
                        Expected
                      </span>
                      <span className="text-xl font-bold text-on-surface">
                        {item.expected}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-high p-2 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-12 h-12 rounded-lg bg-surface-container-lowest text-primary border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-on-primary active:scale-95 transition-all"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        className="w-20 text-center text-xl font-bold bg-transparent border-none focus:ring-0 p-0"
                        type="number"
                        value={item.received}
                        readOnly
                      />
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-12 h-12 rounded-lg bg-surface-container-lowest text-primary border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-on-primary active:scale-95 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Processing Status */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
              <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-widest">
                Processing Status
              </h4>
              <div className="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary z-10">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Received & Sorted</p>
                    <p className="text-xs text-on-surface-variant">
                      10:45 AM by Sarah K.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 relative">
                  <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container z-10 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      Washing Stage
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      In Progress - 32m remaining
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 relative opacity-50">
                  <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant z-10">
                    <div className="w-2 h-2 rounded-full bg-outline-variant" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Drying</p>
                    <p className="text-xs text-on-surface-variant">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Discrepancy Action */}
            <div className="bg-error-container/20 p-6 rounded-xl border-2 border-dashed border-error/30 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-error" />
                <div>
                  <h4 className="text-sm font-bold text-error">
                    Quantity Mismatch
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    The processed quantity does not match the initial intake
                    record.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBypassModal(true)}
                className="w-full bg-error text-on-error py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <LockKeyhole className="w-5 h-5" />
                Bypass Discrepancy
              </button>
            </div>
          </div>
        </div>

        {/* Bypass Modal */}
        {showBypassModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant">
              <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <ShieldAlert className="w-6 h-6 text-error" />
                  <h3 className="text-xl font-bold text-on-surface">
                    Admin Authorization
                  </h3>
                </div>
                <button
                  onClick={() => setShowBypassModal(false)}
                  className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-8 text-center">
                <p className="text-base text-on-surface-variant">
                  Enter Outlet Admin PIN to bypass the item quantity discrepancy
                  for Order #ORD-5521.
                </p>
                <div className="flex justify-center gap-4">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      className="w-14 h-16 text-center text-2xl font-bold bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary shadow-inner"
                      maxLength={1}
                      type="password"
                      value={digit}
                      onChange={(e) => {
                        const newPin = [...pin];
                        newPin[i] = e.target.value.replace(/\D/g, "");
                        setPin(newPin);
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowBypassModal(false)}
                    className="py-3 px-6 rounded-lg border border-outline font-bold text-on-surface hover:bg-surface-container-high transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log("Bypass confirmed", pin.join(""));
                      setShowBypassModal(false);
                    }}
                    className="py-3 px-6 rounded-lg bg-primary text-on-primary font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                  >
                    Confirm Bypass
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
