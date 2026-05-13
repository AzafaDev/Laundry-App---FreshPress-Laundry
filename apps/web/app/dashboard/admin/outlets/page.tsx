"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  UserPlus,
  Plus,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Shirt,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { ServiceCatalogTable } from "@/components/outlets/ServiceCatalogTable";
import { AddOutletModal } from "@/components/outlets/AddOutletModal";

interface Outlet {
  id: number;
  name: string;
  address: string;
  maxDistance: string;
  status: string;
  staffAvatars: string[];
  extraCount: number;
}

const initialOutlets: Outlet[] = [
  {
    id: 1,
    name: "Downtown Hub",
    address: "124 Clean St, Metro City",
    maxDistance: "5",
    status: "Active",
    staffAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8EeLboN4fH75gZbQqKCFANFSZy0VCRxydFTIBWwBgj3QO8hddm4-_zd0Z2f0cWxYXRL9yfcoCbbqQRBR0nfAltAWLccHbMk9vtcBA8cRXwTaQZRPpxT2SUNNoDwhqDAjZcwh7mh0inDZz9EBGSq5ujgsTX3Ht-e3KZLBWacBFGofpjgG-zaOGyfORMxIjxTlIWbAOVPPPpfl_AGkgU8Z2pU-MoGdmkWsFlG8hZLiJNwPJ2gZMwf_ljx5HanYwGLss7Y4HSTE3dCU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhHcE5GdtqJj0n3YrxqaiqHXFqPFPGE_IkJQMOJqBh4MreoYpcKZcMAuwAX5wA5YRkKkJe3yBd9hRN4XGH6Ok3W3CbybpSJf6GxvzOWTxy2D4mL3-WDKNEdMux1uldeLjukmI_WrFZaW9y0HHvVmWni8Gp0E2snEN97ZiCSLyxegf2Qa05Dp1Xy9ZAlTEysJ8om9NijR8ZcQGK1r6ykaqRysA5XcIc6E2ZuXu6IWFFUb0OZ53lROkeW_53b3y1ZNdPgNqmIqK0VaM",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDs8YdBZlFwVD0lH3aVvJAA5JGRavuKHT7UnzqB8LLn5ueh6QV8d1qhMhI9A_jqyB97ycLs1vRukcXexMi6p2PGJy6GRF4lK4ZWO0lWyN9cZfcZpcBVXovk2gtCbBSChLDieKs4RGtBh4D-OARfhhT535NHcQZNP5q5tsQrByEwt1K3uXFQU8IeYjgtEJ5Io0TlyhUtsksj20NTg21jxZa3b2hs3benFS7JH3VQmwL9952m7lgXycfvikOute0IzQxbrn0jxvyWTjY",
    ],
    extraCount: 2,
  },
  {
    id: 2,
    name: "Suburban Express",
    address: "89 Quiet Rd, North Hill",
    maxDistance: "8",
    status: "Active",
    staffAvatars: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAU0EnjIihqfXlYYmbtXDVD1nNDxba3ggREfi49t7wG6rxWdxDcEYydm8s97ulxn3-dnQALm3nJtuKXJApAq7SCJzvPeIJanfHUmJSLKnPh06tWgxCh-AsId0nQdxv88ETH5Ml9LzYsZVIn5gX4ok98y_3GgZRrcY9GboQnFQi6HtNM9TeOzQJaMyOJnK5rneSIMjay6mGVp79EKWoodOWQOO3BA9TJFd0dG64rOCGD1CCxmWrNfo6nb_yT4-YJUyG1fRe7rByTnyU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuACorRniV6LPLIHX7FlbGgSyoTuB2bWd9ujWpfxUhFKkhJ85x9G4nQ7j_NAEzXyS79Mb_uKNOgXeJ5vvYfR5xRGwT0onWq9DU9PdzM7RAVGlQ0OO5p_HjJVuq-W9s87QGQXsKqcwtW2psXOdXfwusFJoHnTd4tF77wSjiSHgOoKdHpYxQd7Zn07tbH_eUytnKFHoDxK8YXxVADJXGqiiICEEJsECvOrGRplL77V8vo_wO6Swu9B0sY0fClNS3AnPej4fqGuF7cQZmE",
    ],
    extraCount: 0,
  },
];

const services = [
  { name: "Wool Suit Jacket", category: "Premium", price: "$12.50", type: "Dry Clean Only" },
  { name: "Bed Linens (King)", category: "Standard", price: "$8.00", type: "Wash & Fold" },
];

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>(initialOutlets);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddOutlet = (data: { name: string; address: string; maxDistance: string }) => {
    const newOutlet: Outlet = {
      id: outlets.length + 1,
      name: data.name,
      address: data.address,
      maxDistance: data.maxDistance,
      status: "Active",
      staffAvatars: [],
      extraCount: 0,
    };
    setOutlets((prev) => [...prev, newOutlet]);
    setShowAddModal(false);
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
          <button className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded text-sm">
            Orders
          </button>
          <button className="text-primary font-semibold border-b-2 border-primary px-2 py-1 text-sm">
            Management
          </button>
        </nav>
        <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxBUTQ23t2D9u6aAKN508JQG_WzLrFAa2mXisziIonKPktEDZ6CP-eHNgHTbVR-04SLtPuv9WS26_NGrjfh4ed5VHuSh6k3o-Qakr10zQkviDFlMjRwzoYpTvXrmDrnEBY-o5UgrJ19leHvpvl20wPlyavj1INxDLU_WMhPfi-K-W_K9cL-O7lvZuz08Tds00ML_NBeANRuFbbMdCkeM23MJcns6odOogUefznbstLLQs146whCl8YqFQQdOCipPouoF3LGHPFDDo"
            alt="Admin avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfIk3uo1qvkguWNe-TJ3uLfkeixIDWCgkYsiDsWf3EILDUrrj8wyFKiqdEnMRwCnluWt4qq-xkWd3qPYFS4g_Wo5R-XvWHtUYMSWQq2314130dlAoa58yialiZlEd9VBTCkR0LG6kMjdef5LuERB9DeFIeSMQUHhHxG3P-stvgVwkFS4cGU3efLhzUpWpkImu3hW7uZ5j0x1ebePD814NyTfwfj_mpv8o0ah5oDE32j6kK71oDGbxh8JWiTy4LrlhO2YQ862KIwcU"
            alt="Admin"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="text-sm font-bold">Super Admin</p>
            <p className="text-xs text-on-surface-variant">admin@freshpress.com</p>
          </div>
        </div>
        <nav className="space-y-1 px-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" active />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" />
        </nav>
      </aside>

      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-on-surface">
                Operations Management
              </h2>
              <p className="text-base text-on-surface-variant">
                Manage your physical outlets and service catalog
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Outlet
            </button>
          </div>

          <div className="flex border-b border-outline-variant mb-6 overflow-x-auto">
            <button className="px-6 py-3 text-primary border-b-2 border-primary font-bold text-sm whitespace-nowrap">
              Outlets
            </button>
            <button className="px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-colors font-medium text-sm whitespace-nowrap">
              Laundry Items
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <div
                key={outlet.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-secondary-container text-on-secondary-container rounded-lg">
                      <Store className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-xs rounded-full">
                      {outlet.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{outlet.name}</h3>
                  <p className="text-base text-on-surface-variant flex items-center gap-1 mb-2">
                    <MapPin className="w-4 h-4" />
                    {outlet.address}
                  </p>
                  {outlet.maxDistance && (
                    <p className="text-xs text-on-surface-variant mb-4">
                      Max service: {outlet.maxDistance} km
                    </p>
                  )}
                </div>
                <div className="border-t border-outline-variant pt-4 mt-4">
                  <p className="text-xs text-on-surface-variant mb-2 uppercase tracking-wider">
                    Staff Assigned
                  </p>
                  <div className="flex -space-x-2 overflow-hidden mb-6">
                    {outlet.staffAvatars.map((avatar, i) => (
                      <Image
                        key={i}
                        src={avatar}
                        alt={`Staff ${i + 1}`}
                        width={32}
                        height={32}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                      />
                    ))}
                    {outlet.extraCount > 0 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-surface-container text-xs">
                        +{outlet.extraCount}
                      </div>
                    )}
                  </div>
                  <button className="w-full py-2 bg-surface-container text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary-fixed transition-colors flex items-center justify-center gap-1">
                    <UserPlus className="w-5 h-5" />
                    Assign Staff
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-on-surface-variant" />
              </div>
              <h4 className="text-xl font-bold text-on-surface-variant">
                New Outlet
              </h4>
              <p className="text-base text-on-surface-variant mt-1">
                Expand your service area
              </p>
            </button>
          </div>

          <ServiceCatalogTable services={services} />

          <div className="mt-12 rounded-2xl overflow-hidden relative h-64 shadow-lg">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-S7CpTWl6wJ6dWuX8V29tHgAztRGMF8WEhRZMusAbJwjyG4bfDJLHgF8tM9RN9B-7Ez6eFnGauEpuXSsdUQrPgjdysA_RYgeTMz3LDxkcmaJmPZGQ9WKh7DEkCDbT6gi0OwwDvXN5Zbyxm_Baz1OukelpZ-qrYtUI2XtOfpOBWaJT__ZyBpFOhNGWrTQtKzyK5LiRMZPLkeMrPi3SsgVEaSqjyjjOvEHdI6_XNorkJmL72q6IxAbmoiPZj3jbw72RGiubVsH0B8E"
              alt="Facility image"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              <h4 className="text-white text-xl font-bold">
                Expansion Dashboard
              </h4>
              <p className="text-white/80 text-base">
                Planning a new location? Use our analytics to find the perfect spot.
              </p>
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddOutletModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddOutlet}
        />
      )}

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
