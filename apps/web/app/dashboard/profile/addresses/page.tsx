"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  PlusCircle,
  House,
  Briefcase,
  MapPin,
  Pencil,
  Trash2,
  User,
  Phone,
  Circle,
  Truck,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BarChart3,
  Settings,
  LogOut,
  Shirt,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const addresses = [
  {
    id: 1,
    label: "Home",
    icon: "home",
    isMain: true,
    fullAddress: "742 Evergreen Terrace, Springfield, IL 62704, United States",
    receiver: "Homer J. Simpson",
    phone: "+1 (555) 012-3456",
  },
  {
    id: 2,
    label: "Office",
    icon: "work",
    isMain: false,
    fullAddress:
      "Springfield Nuclear Power Plant, Sector 7G, Springfield, IL 62701",
    receiver: "Homer J. Simpson",
    phone: "+1 (555) 987-6543",
  },
  {
    id: 3,
    label: "Weekend Home",
    icon: "location",
    isMain: false,
    fullAddress: "123 Rural Lane, Shelbyville, IL 62565, United States",
    receiver: "Marge Simpson",
    phone: "+1 (555) 246-8101",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  home: <House className="w-5 h-5 text-primary" />,
  work: <Briefcase className="w-5 h-5 text-on-surface-variant" />,
  location: <MapPin className="w-5 h-5 text-on-surface-variant" />,
};

// Desktop sidebar – follows the exact style of the existing Sidebar component
const ProfileSidebar = () => (
  <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
    <div className="flex items-center gap-3 px-5 py-6">
      <Shirt className="text-primary w-7 h-7" />
      <span className="text-xl font-bold text-primary tracking-tight">
        FreshPress
      </span>
    </div>
    <div className="mx-4 p-4 bg-surface-container-high rounded-xl flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container flex-shrink-0">
        <img
          alt="Admin"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsDpBafJnImcjEQ8GmjkAhvVf5y58q5DxlKg1MWXwNrosf8HwK4DPSWSJeD-ZvRaLFeP4PYesIyenifAhFh-M-s2n341fgXxtDcdZ_RnFd7saEkxJmSbZqnijWxSM-RoxczQBQh5ajv3uGaSczrmueqXI4iQKvFeJnTwXESbSQYCpoKmpkbRLNtsjn3ptlJWovP86ZK5ZETi1xMZQsX7guKv0RYdb6La6bPpOU3pb6eYuIOQQOTQL10ZIx2VKz0YfCi_o4_OXkCGU"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-on-surface truncate">
          Super Admin
        </span>
        <span className="text-xs text-on-surface-variant truncate">
          admin@freshpress.com
        </span>
      </div>
    </div>
    <div className="mx-4 h-px bg-outline-variant my-3" />
    <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
      <SidebarLink icon={LayoutDashboard} label="Dashboard" />
      <SidebarLink icon={ReceiptText} label="Orders" />
      <SidebarLink icon={Package} label="Inventory" />
      <SidebarLink icon={Store} label="Outlets" />
      <SidebarLink icon={User} label="Profile" active />
      <SidebarLink icon={BarChart3} label="Reports" />
    </nav>
    <div className="p-3 mt-auto">
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
        <Settings className="w-5 h-5" />
        Settings
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 rounded-lg transition-colors">
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
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
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? "bg-primary-container/15 text-primary font-semibold shadow-sm"
        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
  </a>
);

export default function ManageAddressesPage() {
  const [addressList] = useState(addresses);

  const handleEdit = (id: number) => console.log("Edit address", id);
  const handleDelete = (id: number) => console.log("Delete address", id);
  const handleSetMain = (id: number) => console.log("Set as main", id);
  const handleAddNew = () => console.log("Navigate to add address");

  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 lg:pb-0">
      {/* Header with back button */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant lg:pl-72">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/profile"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="text-primary w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-primary">Manage Addresses</h1>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDNGP5yepgCufi5nrUuMZjFx7X-mnAeMkAbtd_oLjmgI6AmBDw9Yh4Kj3rbJXLWccdnqCB8hlsUarpsNcFEX7zVEb2R8nR_QzZd46P9JRW4l91g0vP79qELOeaQ7g-Du4QFIXrNZuSAWJLvkCuFGfXQ0XExYdGppA90ODhuZLoNusTujqqFGzkcz_pLsfFYzRXX235qEAXngKhT2KKO-d7R__NDpRVeGus7Kj7SDveerzG7A_nTXuq-w12Qe73iXiaWS76866jHFU"
            alt="User avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      <ProfileSidebar />

      <main className="lg:pl-72">
        <div className="max-w-[42rem] mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Add New Address Button */}
          <button
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-4 px-6 rounded-lg font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Add New Address</span>
          </button>

          {/* Address List */}
          <div className="space-y-4">
            {addressList.map((addr) => (
              <div
                key={addr.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {iconMap[addr.icon]}
                    <h3 className="text-base font-bold text-on-background">
                      {addr.label}
                    </h3>
                    {addr.isMain && (
                      <span className="bg-primary-container text-on-primary-container text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                        Main Address
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(addr.id)}
                      className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 text-error hover:bg-error-container rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-on-surface-variant">
                  <p className="text-base leading-relaxed">
                    {addr.fullAddress}
                  </p>
                  <div className="flex flex-col gap-1 text-xs font-medium border-t border-outline-variant pt-2 mt-2">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{addr.receiver}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                </div>

                {!addr.isMain && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSetMain(addr.id)}
                      className="flex items-center gap-1 text-primary font-bold text-sm hover:bg-primary-container/10 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Circle className="w-4 h-4" />
                      Set as Main Address
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom illustration */}
          <div className="pt-6 text-center space-y-4 opacity-60">
            <div className="w-24 h-24 mx-auto bg-surface-container-high rounded-full flex items-center justify-center">
              <Truck className="text-on-surface-variant w-12 h-12" />
            </div>
            <p className="text-base text-on-surface-variant max-w-[20rem] mx-auto">
              Your orders will be picked up and delivered to your selected main
              address by default.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
