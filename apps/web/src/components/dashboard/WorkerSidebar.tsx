import { LayoutDashboard, ReceiptText, Package } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  receipt_long: <ReceiptText className="w-5 h-5" />,
  inventory_2: <Package className="w-5 h-5" />,
};

export const WorkerSidebar = () => (
  <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-4 w-72 bg-surface-container-low border-r border-outline-variant z-40">
    <div className="mt-20 flex flex-col gap-1">
      <div className="p-4 mb-4">
        <p className="text-sm text-on-surface-variant">Worker Dashboard</p>
        <p className="text-xl font-bold text-primary">Super Admin</p>
      </div>

      <nav className="flex flex-col gap-1">
        <SidebarItem icon="dashboard" label="Dashboard" active />
        <SidebarItem icon="receipt_long" label="Orders" />
        <SidebarItem icon="inventory_2" label="Inventory" />
      </nav>
    </div>
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
    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-secondary-container text-on-secondary-container translate-x-1"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`}
    href="#"
  >
    <span>{iconMap[icon]}</span>
    <span>{label}</span>
  </a>
);
