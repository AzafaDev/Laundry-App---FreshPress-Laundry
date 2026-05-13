"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shirt,
  ChevronRight,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  PlusCircle,
  ShoppingBag,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { DynamicItemList, type DynamicItem } from "@/components/orders/DynamicItemList";

const pickupRequests = [
  { id: 1, customer: "Budi Santoso", orderId: "#REQ-1001", items: "3kg • Wash & Fold", outlet: "Downtown Hub" },
  { id: 2, customer: "Siti Aminah", orderId: "#REQ-1002", items: "2 Items • Dry Clean", outlet: "Westside Branch" },
  { id: 3, customer: "Andi Wijaya", orderId: "#REQ-1003", items: "5kg • Express", outlet: "Downtown Hub" },
];

let itemIdCounter = 1;

export default function CreateOrderPage() {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState("");
  const [totalKilo, setTotalKilo] = useState("");
  const [items, setItems] = useState<DynamicItem[]>([
    { id: itemIdCounter++, name: "", quantity: 1, price: "" },
  ]);

  const handleAdd = () => {
    setItems((prev) => [
      ...prev,
      { id: itemIdCounter++, name: "", quantity: 1, price: "" },
    ]);
  };

  const handleRemove = (id: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (id: number, field: keyof DynamicItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call
    console.log("Create order:", { selectedRequest, totalKilo, items });
    router.push("/dashboard/admin/orders");
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <button className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded text-sm">
            Dashboard
          </button>
          <button className="text-primary font-semibold border-b-2 border-primary px-2 py-1 text-sm">
            Orders
          </button>
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

      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
            <BadgeCheck className="w-6 h-6 text-on-secondary-container" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Super Admin</p>
            <p className="text-xs text-on-surface-variant">admin@freshpress.com</p>
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
        <div className="max-w-2xl mx-auto">
          <nav className="flex items-center text-xs text-on-surface-variant mb-2">
            <span>Admin</span>
            <ChevronRight className="w-[14px] h-[14px] mx-1" />
            <span>Orders</span>
            <ChevronRight className="w-[14px] h-[14px] mx-1" />
            <span className="text-primary font-bold">Create Order</span>
          </nav>

          <h2 className="text-2xl font-bold text-on-surface mb-1">
            Buat Order Baru
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Buat order laundry dari permintaan pickup yang sudah ada.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
                  Pilih Pickup Request
                </label>
                <div className="relative">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <select
                    value={selectedRequest}
                    onChange={(e) => setSelectedRequest(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base appearance-none"
                  >
                    <option value="">Pilih permintaan pickup...</option>
                    {pickupRequests.map((req) => (
                      <option key={req.id} value={req.id}>
                        {req.orderId} - {req.customer} ({req.items})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="totalKilo"
                  className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5"
                >
                  Total Kilo
                </label>
                <input
                  id="totalKilo"
                  type="number"
                  step="0.1"
                  placeholder="Masukkan total berat (kg)"
                  value={totalKilo}
                  onChange={(e) => setTotalKilo(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base"
                />
              </div>

              <DynamicItemList
                items={items}
                onAdd={handleAdd}
                onRemove={handleRemove}
                onChange={handleChange}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <PlusCircle className="w-5 h-5" />
                  Buat Order
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
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
}
