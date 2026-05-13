import { Shirt } from "lucide-react";

export const DriverTopBar = () => (
  <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
    <div className="flex items-center gap-2">
      <Shirt className="text-primary w-6 h-6" />
      <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
    </div>
    <div className="flex items-center gap-4">
      <span className="hidden md:block text-sm text-on-surface-variant">
        Driver: Alex Johnson
      </span>
      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold overflow-hidden">
        <img
          alt="User Profile"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSEHdi7kseOyqSj05NOuag_ldzc-H3JRa-tcgtLJXdX4Cy_bC31ZSwDSvrIXy_N_5TiuqEzI9qk2uaEREDC2AmzwTLPUFChs_J9e5Z4vGdgbnwXf1s1V4zlNfD3mpC5LprEqjPKTEGRrht0I0JpoFILma-vnIAyHEUZptQLvr1luFmtxpjg4EVMqAJTUy0M7JBoEb977PrKvsFyJakVnPlCtbK9GXoivlB1sV-qftn_wbRFARPD-Qye4uagFlTYL_Fu5PGdXlRujk"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </header>
);
