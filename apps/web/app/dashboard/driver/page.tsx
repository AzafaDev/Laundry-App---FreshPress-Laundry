import Image from "next/image";
import {
  Bell,
  ClipboardList,
  ListFilter,
  Map,
  MapPin,
  Navigation,
  Phone,
  MoreVertical,
  ShoppingBag,
  Star,
  QrCode,
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  Shirt,
  Truck,
  Home,
  User,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { ShiftBadge } from "@/components/ui/ShiftBadge";

export default function DriverDashboardPage() {
  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <Bell className="text-on-surface-variant w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
          </button>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJCjbsSWOQdviSh-_vdJ8vZ2FNTMazEDV8BNgdrjVPA5wpd4wa3_Is_cfr6WxC4z86FKQC88_QcfQeD77LwW9bIhP7mScd84kg0dR1Sx1fZfVCd6FdKNtx9XnT3AzTG2z_5VH0t283HDEhCb8hOfycWABWXEpTAriSrfefMbODGqS_fBMPuTYgdhWECMvFkEo-m7yppBILD3Esg7riiPAOc9XAVYHYygVbEsYb36hUHzDE13ndB4jaf3UcO-iMXIA5l746_oP_dtQ"
              alt="Driver profile"
              width={40}
              height={40}
              className="object-cover rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 mb-6 px-4 pt-4">
          <Shirt className="text-primary w-8 h-8" />
          <h1 className="text-lg font-bold text-primary">FreshPress</h1>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
          <SidebarLink icon={ReceiptText} label="Orders" />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
        </nav>
        <div className="border-t border-outline-variant pt-4 px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary">
              SA
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Super Admin</p>
              <p className="text-xs text-on-surface-variant">
                admin@freshpress.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 p-4 md:p-8 space-y-6">
        {/* Notification Banner */}
        <div className="bg-primary-container text-on-primary-container p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary-fixed text-on-primary-fixed p-2 rounded-lg">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold">New Requests</p>
              <p className="text-base opacity-90">
                3 new pickup requests available in your area.
              </p>
            </div>
          </div>
          <button className="bg-on-primary-container text-primary-container px-4 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors">
            View All
          </button>
        </div>

        {/* Shift Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-variant">Shift:</span>
          <ShiftBadge shift="Morning" />
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">Active Tasks</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">
              <ListFilter className="w-5 h-5 text-on-surface-variant" />
            </button>
            <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">
              <Map className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Task Card 1 */}
          <TaskCard
            orderId="#FP-8291"
            status="On the Way"
            statusColor="bg-secondary-container text-on-secondary-container"
            type="Delivery"
            typeIcon={Truck}
            typeColor="bg-primary/10 text-primary"
            time="15:00 - 17:00 Today"
            address="428 Corporate Plaza, Suite 102, Tech District"
            primaryAction="Complete Task"
            primaryActionClass="bg-primary text-on-primary hover:opacity-90"
            secondaryIcon={Navigation}
            enableActions
          />

          {/* Task Card 2 */}
          <TaskCard
            orderId="#FP-8304"
            status="Assigned"
            statusColor="bg-surface-container-highest text-on-surface-variant"
            type="Pickup"
            typeIcon={ShoppingBag}
            typeColor="bg-tertiary/10 text-tertiary"
            time="17:30 - 18:30 Today"
            address="89 Riverside Drive, Apt 4B, East Side"
            primaryAction="Start Pickup"
            primaryActionClass="border border-primary text-primary hover:bg-primary/5"
            secondaryIcon={Phone}
            enableActions
          />

          {/* Task Card 3 */}
          <TaskCard
            orderId="#FP-8311"
            status="Assigned"
            statusColor="bg-surface-container-highest text-on-surface-variant"
            type="Delivery"
            typeIcon={Truck}
            typeColor="bg-primary/10 text-primary"
            time="09:00 - 11:00 Tomorrow"
            address="12 Oakwood Terrace, North Hills"
            primaryAction="Scheduled"
            primaryActionClass="border border-outline text-outline cursor-not-allowed opacity-60"
            secondaryIcon={MoreVertical}
            disableActions
          />
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-6">
          {/* Earnings Overview */}
          <div className="md:col-span-8 bg-white border border-outline-variant rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-2">
                Earnings Overview
              </h3>
              <p className="text-base text-on-surface-variant">
                Great job today! You've completed 85% of your daily goal.
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-xs text-outline uppercase font-bold">
                  Today's Total
                </p>
                <p className="text-3xl font-bold text-primary">$184.50</p>
              </div>
              <div className="flex gap-1 items-end h-16">
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "40%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "70%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "55%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "90%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "65%" }}
                />
                <div
                  className="w-8 bg-primary rounded-t-sm"
                  style={{ height: "85%" }}
                />
              </div>
            </div>
          </div>

          {/* Driver Rating */}
          <div className="md:col-span-4 bg-secondary text-on-secondary rounded-2xl p-6 space-y-4 flex flex-col justify-center">
            <Star className="w-10 h-10 fill-current" />
            <div className="space-y-1">
              <p className="text-5xl font-bold leading-none">4.9</p>
              <p className="text-lg font-bold opacity-90">Driver Rating</p>
            </div>
            <p className="text-sm opacity-80">Based on last 50 deliveries</p>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-4 lg:bottom-12 lg:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <QrCode className="w-8 h-8" />
      </button>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// ---------- Task Card Component ----------
function TaskCard({
  orderId,
  status,
  statusColor,
  type,
  typeIcon: TypeIcon,
  typeColor,
  time,
  address,
  primaryAction,
  primaryActionClass,
  secondaryIcon: SecondaryIcon,
  enableActions = true,
  disableActions = false,
}: {
  orderId: string;
  status: string;
  statusColor: string;
  type: string;
  typeIcon: React.ElementType;
  typeColor: string;
  time: string;
  address: string;
  primaryAction: string;
  primaryActionClass: string;
  secondaryIcon: React.ElementType;
  enableActions?: boolean;
  disableActions?: boolean;
}) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider">
              Order ID
            </span>
            <p className="text-base font-bold">{orderId}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColor}`}
          >
            {status}
          </div>
        </div>
        <div className="flex items-center gap-4 p-2 bg-surface-container-low rounded-lg">
          <div className={`${typeColor} p-2 rounded-full`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{type}</p>
            <p className="text-base text-on-surface-variant">{time}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-outline mt-0.5" />
            <p className="text-base text-on-surface">{address}</p>
          </div>
        </div>
      </div>
      {enableActions && (
        <div className="px-4 py-2 bg-surface-container-lowest border-t border-outline-variant flex gap-2">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${primaryActionClass}`}
            disabled={disableActions}
          >
            {primaryAction}
          </button>
          {SecondaryIcon && (
            <button className="px-2 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
              <SecondaryIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Sidebar Link Component ----------
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
