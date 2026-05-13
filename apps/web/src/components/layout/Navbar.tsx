import { Shirt, Menu } from "lucide-react";

export const Navbar = () => (
  <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
    <div className="flex items-center gap-2">
      <Shirt className="text-primary w-6 h-6" />
      <span className="text-xl font-bold text-primary">FreshPress</span>
    </div>

    {/* Desktop Menu */}
    <div className="hidden md:flex gap-6 items-center">
      <a
        className="text-primary font-semibold border-b-2 border-primary"
        href="#"
      >
        Home
      </a>
      <a
        className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded-lg transition-colors"
        href="#"
      >
        Orders
      </a>
      <a
        className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded-lg transition-colors"
        href="#"
      >
        Pickup
      </a>

      <div className="flex items-center gap-4 ml-4 border-l border-outline-variant pl-6">
        <button className="text-primary text-sm font-medium hover:underline">
          Masuk
        </button>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">
          Daftar
        </button>
      </div>
    </div>

    {/* Mobile Menu Toggle */}
    <button className="md:hidden text-on-surface" aria-label="Buka menu">
      <Menu className="w-6 h-6" />
    </button>
  </header>
);
