import { Home, Shirt, Package, User } from "lucide-react";

const NavItem = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <a
    className={`flex flex-col items-center justify-center ${
      active ? "text-primary font-bold scale-95" : "text-on-surface-variant"
    }`}
    href="#"
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px]">{label}</span>
  </a>
);

export const BottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl">
    <NavItem icon={Home} label="Home" active />
    <NavItem icon={Shirt} label="Orders" />
    <NavItem icon={Package} label="Pickup" />
    <NavItem icon={User} label="Profile" />
  </nav>
);
