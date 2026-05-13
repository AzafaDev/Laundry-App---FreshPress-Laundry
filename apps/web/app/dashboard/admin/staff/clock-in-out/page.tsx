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
  LogOut,
  MapPin,
  Clock,
  BarChart,
  Navigation,
  Share2,
  Home,
  User,
  Truck,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const recentLogs = [
  {
    label: "Check In",
    time: "08:00 AM",
    location: "Main Hub",
    color: "bg-primary",
  },
  {
    label: "Break Start",
    time: "10:15 AM",
    location: "On-site",
    color: "bg-secondary",
  },
  {
    label: "Break End",
    time: "10:30 AM",
    location: "On-site",
    color: "bg-primary",
  },
];

export default function StaffClockInOutPage() {
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
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded-lg text-sm"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="text-primary font-semibold border-b-2 border-primary px-2 py-1 text-sm"
          >
            Home
          </a>
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded-lg text-sm"
          >
            Orders
          </a>
        </nav>
        <div className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsZZyVDAVIE6t1U6-NT_F62lUfqXnYAYyW-l7cz9OyAZ_MMi3_WkSOkDrtUmO89OSyANJCZXYbM7ZbvGbKGKe7_g9CBflJazrfOkmwHFhWeSMakijHvAJ-Iia8inRmCpxIKL0FKzljO8wLia961fAXSNQ_ArNkV-qBRewzcFHCcNfhHQkiNrGTVuJSeqcNnHTKgfulbeS37e52ME6DUb0ivlguJYWUovc1BdXRs14Ki2xtwf9s14Otv2k8WoSayNN_Ynm4e5hDND0"
            alt="User avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <Shirt className="text-primary w-8 h-8" />
          <span className="text-lg font-bold text-primary">FreshPress</span>
        </div>
        <nav className="space-y-1 px-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" active />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" />
        </nav>
        <div className="mt-auto pt-6 border-t border-outline-variant p-4">
          <div className="flex items-center gap-3">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCNi9guvBt4lzbMwWsuGkRD8vYQcvkb4c5o4D9n5sFPZ0Su5hzfmBUmnEWnlmwsgx9E7VouB7JrVsRq0eGKKPcMl8psZA0b46ljfDqt-VtBtJOfCVD50g_1W5ekY6GfWJ7uHVDIjlafuEv02QR40Ni0H2lFK1ihj5V1E8xmeFNoyjcxu77rU6Ck1BcA412X-NI7OWqC5JC9sU4Vh9-F5utavSkOk7bLOP14Al_gBQtNOm_bZ1lltgjvPYR-KQNsgF8Z3dFyZ4QO4s"
              alt="Admin"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="text-sm font-bold">Super Admin</p>
              <p className="text-xs text-on-surface-variant">
                admin@freshpress.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Action Card */}
            <div className="lg:col-span-8 space-y-6">
              <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                <div className="text-center md:text-left z-10">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                    <span className="text-primary font-bold text-sm uppercase tracking-wider">
                      Active Shift
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-base">
                    Current Time
                  </p>
                  <h2 className="text-5xl font-bold text-on-surface">
                    10:42 AM
                  </h2>
                  <p className="text-on-surface-variant text-lg">
                    Wednesday, Oct 24, 2023
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 z-10">
                  <button className="group relative w-48 h-48 flex flex-col items-center justify-center rounded-full bg-primary hover:bg-primary-container text-on-primary shadow-lg transition-all active:scale-95">
                    <LogOut className="w-12 h-12 mb-1" />
                    <span className="text-xl font-bold">Check Out</span>
                    <div className="absolute inset-0 rounded-full border-4 border-primary-container/30 border-t-primary-container animate-spin-slow group-hover:border-t-white" />
                  </button>
                  <div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-1 rounded-full border border-secondary-container">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Location Verified: Main Hub</span>
                  </div>
                </div>
              </section>

              {/* Status Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-6 h-6 text-secondary" />
                    <h3 className="text-xl font-bold text-on-surface">
                      Shift Details
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant text-base">
                        Designation
                      </span>
                      <span className="text-on-surface font-bold text-base">
                        Morning Shift
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant text-base">
                        Working Hours
                      </span>
                      <span className="text-on-surface font-bold text-base">
                        08:00 - 16:00
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 mt-4 overflow-hidden">
                      <div
                        className="bg-secondary h-full"
                        style={{ width: "35%" }}
                      />
                    </div>
                    <p className="text-xs text-secondary mt-1">
                      2h 42m completed
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart className="w-6 h-6 text-tertiary" />
                    <h3 className="text-xl font-bold text-on-surface">
                      Today's Summary
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/50 p-2 rounded-lg border border-outline-variant/50">
                      <p className="text-xs text-on-surface-variant uppercase">
                        Total Worked
                      </p>
                      <p className="text-xl font-bold text-on-surface">02:42</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded-lg border border-outline-variant/50">
                      <p className="text-xs text-on-surface-variant uppercase">
                        Break Time
                      </p>
                      <p className="text-xl font-bold text-on-surface">00:15</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Map */}
              <section className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-on-surface">
                      Current Location
                    </h3>
                  </div>
                  <span className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    Real-time Tracking On
                  </span>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUPsQlTorI3O5p0-Y9g9OmNOX3FulbAoLU9mZZT6FT7VQ6qmjlLEGAuhcsbFZJiO5yJ0HONZPcIHkQ0ytJ7MxJx1DBeDQ4NnojiLsKkGrjdIz8jrd42O9C8NtlVPtBQmOtfu8kaX8Q_SKdjptfW-xlHusu8_1RLhwyFOP7GWiOOznOjzPqogz70PpBPjiHXhfKPOUxdjm4d7Ty_iNONNdz-pNE1YtrAccgf218DfSx5WZxFjAUD_SmoJkqEkj2aQfPS2V46JFqsnY"
                    alt="Map"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-lg border border-outline-variant shadow-lg">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="text-xs font-bold text-on-surface">
                          FreshPress Central Hub
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          122 Industry Way, Ste 400
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Side History Panel */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-on-surface">
                    Recent Logs
                  </h3>
                  <button className="text-primary text-sm hover:underline transition-all">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentLogs.map((log, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2 h-2 rounded-full ${log.color} mt-1`}
                        />
                        {i < recentLogs.length - 1 && (
                          <div className="w-0.5 flex-grow bg-outline-variant my-1" />
                        )}
                      </div>
                      <div className={i < recentLogs.length - 1 ? "pb-4" : ""}>
                        <p className="text-sm font-bold text-on-surface">
                          {log.label}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {log.time} • {log.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-outline-variant">
                  <div className="bg-surface-container p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-on-surface mb-2">
                      Pro-Tip for Drivers
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Always ensure your vehicle status is updated before
                      checking out for the day to avoid administrative delays.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
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
