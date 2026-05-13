import { BadgeCheck, LayoutDashboard, Truck, ReceiptText, Package, BarChart3 } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  badge: <BadgeCheck className="w-5 h-5" />,
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  local_shipping: <Truck className="w-5 h-5" />,
  receipt_long: <ReceiptText className="w-5 h-5" />,
  inventory_2: <Package className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
};

export const DriverSidebar = () => (
  <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-4 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm pt-20">
    {/* Admin Info */}
    <div className="px-2 mb-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-bright border border-outline-variant">
        <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
          <BadgeCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">Super Admin</p>
          <p className="text-xs text-on-surface-variant">
            admin@freshpress.com
          </p>
        </div>
      </div>
    </div>

    <nav className="flex flex-col gap-2">
      <SidebarItem icon="dashboard" label="Dashboard" />
      <SidebarItem icon="local_shipping" label="Active Tasks" active />
      <SidebarItem icon="receipt_long" label="Orders" />
      <SidebarItem icon="inventory_2" label="Inventory" />
      <SidebarItem icon="analytics" label="Reports" />
    </nav>
  </aside>
);

const SidebarItem = ({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <a
    className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
      active
        ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`}
    href="#"
  >
    <span>{iconMap[icon]}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);
