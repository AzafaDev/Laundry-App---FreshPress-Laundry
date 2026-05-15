"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Truck, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const NavItem = ({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}) => (
  <Link
    href={href}
    className={`flex flex-col items-center justify-center ${
      active ? "text-primary font-bold scale-95" : "text-on-surface-variant"
    }`}
    aria-label={label}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px]">{label}</span>
  </Link>
);

export const BottomNav = () => {
  const pathname = usePathname();
  const { accessToken } = useAuthStore();
  const isAuthenticated = !!accessToken;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface py-2 px-4 border-t border-outline-variant shadow-lg rounded-t-xl pb-safe">
      <NavItem icon={Home} label="Home" href="/" active={pathname === "/"} />
      <NavItem
        icon={Shirt}
        label="Orders"
        href={isAuthenticated ? "/dashboard/orders" : "/login"}
        active={pathname.startsWith("/dashboard/orders")}
      />
      <NavItem
        icon={Truck}
        label="Pickup"
        href={isAuthenticated ? "/dashboard/pickup" : "/login"}
        active={pathname.startsWith("/dashboard/pickup")}
      />
      <NavItem
        icon={User}
        label="Profile"
        href={isAuthenticated ? "/profile" : "/login"}
        active={pathname === "/profile"}
      />
    </nav>
  );
};
