import {
  LayoutDashboard,
  Receipt,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Settings,
  LogOut,
  Shirt,
} from "lucide-react";

export const Sidebar = () => (
  <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
    {/* Brand */}
    <div className="flex items-center gap-3 px-5 py-6">
      <Shirt className="text-primary w-[28px] h-[28px]" />
      <span className="text-xl font-bold text-primary tracking-tight">
        FreshPress
      </span>
    </div>

    {/* User Profile */}
    <div className="mx-4 p-4 bg-surface-container-high rounded-xl flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container flex-shrink-0">
        <img
          alt="Admin"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhl473wFLBtfgkOJXaDEKjx-62z4AN8c6kkNGOJsgne1eYyaG60o4HsrG2APliH2tEsQK-L-6zhk0NhF9woMhjDfVIe2lr7XOKsQoWfWm2Al8nvIpGHhnU4uQD18i9ExA0Gi1OzaghtQeY9E3aqnYctzinBBQI4ooLUMyEJstVnVbM9yhryFqK_hOebi2ovj5UcMArcLuNpm6tPlixlzz7Uw0NmPuGf0E_2bHj71Nn2eQzuTANnu0741NSwWvNX7GNR1ZOapLV0ew"
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

    {/* Divider */}
    <div className="mx-4 h-px bg-outline-variant my-3" />

    {/* Navigation */}
    <nav className="flex-1 flex flex-col gap-0.5 px-3 overflow-y-auto">
      <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active />
      <SidebarItem icon={<Receipt />} label="Orders" />
      <SidebarItem icon={<Package />} label="Inventory" />
      <SidebarItem icon={<Store />} label="Outlets" />
      <SidebarItem icon={<BadgeCheck />} label="Staff" />
      <SidebarItem icon={<BarChart3 />} label="Reports" />
    </nav>

    {/* Bottom Actions */}
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

const SidebarItem = ({
  icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) => (
  <a
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? "bg-primary-container/15 text-primary font-semibold shadow-sm"
        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
    }`}
    href="#"
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
  </a>
);
