import { Shirt, Menu } from "lucide-react";

export const Navbar = () => (
  <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
    <div className="flex items-center gap-2">
      <Shirt className="text-primary w-6 h-6" />
      <span className="text-xl font-bold text-primary">FreshPress Laundry</span>
    </div>
    <DesktopMenu />
    <button className="md:hidden text-on-surface">
      <Menu />
    </button>
  </header>
);

const DesktopMenu = () => (
  <div className="hidden md:flex gap-6 items-center">
    <a
      className="text-primary font-semibold border-b-2 border-primary"
      href="#"
    >
      Home
    </a>
    <a
      className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded-lg"
      href="#"
    >
      Orders
    </a>
    <a
      className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded-lg"
      href="#"
    >
      Pickup
    </a>
    <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center">
      <Shirt className="text-on-surface-variant" />
    </div>
  </div>
);
