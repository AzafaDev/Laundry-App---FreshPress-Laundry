"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ListFilter,
  ArrowUp,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BarChart3,
  Shirt,
  Home,
  User,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const staffData = [
  {
    id: 1,
    initials: "JD",
    name: "John Dawson",
    email: "john.d@freshpress.com",
    role: "Outlet Admin",
    status: "Active",
    statusColor: "bg-primary-fixed text-on-primary-fixed",
    outlet: "Downtown Hub",
    avatarColor: "bg-primary-fixed",
    avatarText: "text-primary",
  },
  {
    id: 2,
    initials: "MR",
    name: "Maria Rodriguez",
    email: "m.rodriguez@freshpress.com",
    role: "Driver",
    status: "On Duty",
    statusColor: "bg-secondary-container text-on-secondary-container",
    outlet: "Northside Branch",
    avatarColor: "bg-secondary-fixed",
    avatarText: "text-secondary",
  },
  {
    id: 3,
    initials: "SK",
    name: "Sam Knight",
    email: "s.knight@freshpress.com",
    role: "Worker",
    status: "Offline",
    statusColor: "bg-outline-variant text-on-surface-variant",
    outlet: "Westside Outlet",
    avatarColor: "bg-tertiary-fixed",
    avatarText: "text-tertiary",
  },
];

// Custom mobile bottom nav – Profile active
const StaffMobileNav = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-sm px-md pb-safe border-t border-outline-variant shadow-lg rounded-t-xl">
    <NavTab icon={Home} label="Home" />
    <NavTab icon={Shirt} label="Orders" />
    <NavTab icon={Shirt} label="Pickup" />{" "}
    {/* using Shirt for pickup, but could be Truck */}
    <NavTab icon={User} label="Profile" active />
  </nav>
);

const NavTab = ({
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
    className={`flex flex-col items-center justify-center transition-transform duration-150 active:scale-95 ${
      active ? "text-primary font-bold scale-95" : "text-on-surface-variant"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium">{label}</span>
  </a>
);

export default function StaffDirectoryPage() {
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
            Home
          </Link>
          <Link
            href="/dashboard/admin/staff"
            className="text-primary font-semibold border-b-2 border-primary px-2 py-1"
          >
            Staff
          </Link>
        </nav>
        <div className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden border border-outline-variant">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCG8fTmXdyyY_9GGS6TYdyM7AyEJFJgQAiDA7fRNwKrVfwaCaeyAIosYasGx8AovGBE78f9orzuyAU4effBA0kuJ0WYkmV3KL4tXgsqq623tqJ5jmn4vQeS-c--vNfbVBUdzC6EBLO2ElNCPMw5oERC9GW0Y1AiLz75i0GZC-shQ91fkWxCZgvk2iIBrwcv3UG5Rq16ulQgbtNUfGVvTRyjahUQpMRYTSTNEafoqOl_-2P57_NvQ8aoQrXQWfYMJRtFG-nPITMDQ4"
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
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <BadgeCheck className="w-6 h-6" />
          </div>
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
          <SidebarLink icon={BadgeCheck} label="Staff" active />
          <SidebarLink icon={BarChart3} label="Reports" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-5xl font-bold text-on-surface">
                Staff Directory
              </h2>
              <p className="text-lg text-on-surface-variant">
                Manage and monitor your laundry service team across all
                locations.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-2 flex items-center shadow-sm">
              <Search className="w-5 h-5 text-outline mx-4" />
              <input
                className="flex-grow bg-transparent border-none focus:ring-0 text-base py-3 px-2"
                placeholder="Search by name, email, or employee ID..."
                type="text"
              />
            </div>
            <div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-2 flex items-center shadow-sm">
              <ListFilter className="w-5 h-5 text-outline mx-4" />
              <select className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium py-3 px-2 appearance-none">
                <option>All Roles</option>
                <option>Outlet Admin</option>
                <option>Worker</option>
                <option>Driver</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-4 py-6 text-left">
                      <button className="flex items-center gap-1 text-sm font-bold text-primary">
                        Employee Name
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-4 py-6 text-left text-sm font-bold text-on-surface-variant">
                      Role
                    </th>
                    <th className="px-4 py-6 text-left text-sm font-bold text-on-surface-variant">
                      Status
                    </th>
                    <th className="px-4 py-6 text-left text-sm font-bold text-on-surface-variant">
                      Outlet
                    </th>
                    <th className="px-4 py-6 text-right text-sm font-bold text-on-surface-variant">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {staffData.map((staff) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full ${staff.avatarColor} flex items-center justify-center font-bold ${staff.avatarText}`}
                          >
                            {staff.initials}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-on-surface">
                              {staff.name}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              {staff.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6 text-sm text-on-surface-variant">
                        {staff.role}
                      </td>
                      <td className="px-4 py-6">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${staff.statusColor}`}
                        >
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-4 py-6 text-sm text-on-surface-variant">
                        {staff.outlet}
                      </td>
                      <td className="px-4 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 rounded-lg hover:bg-surface-container-high text-primary transition-all active:scale-95">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-surface-container-high text-secondary transition-all active:scale-95">
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-error-container text-error transition-all active:scale-95">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest">
              <p className="text-sm text-on-surface-variant">
                Showing 1 to 3 of 42 employees
              </p>
              <div className="flex items-center gap-1">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold shadow-sm">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-all">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-all">
                  3
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 lg:bottom-4 right-4 lg:right-8 flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all z-40 group">
        <UserPlus className="w-5 h-5" />
        <span className="text-sm font-bold">Add User</span>
      </button>

      <StaffMobileNav />
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
