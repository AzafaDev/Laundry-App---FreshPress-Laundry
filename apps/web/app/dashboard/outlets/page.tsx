import { Search, Filter, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { OutletCard } from "@/components/outlets/OutletCard";
import { OutletMap } from "@/components/outlets/OutletMap";

const outlets = [
  {
    name: "FreshPress Sudirman",
    distance: "0.8 km",
    rating: 4.8,
    price: "Rp 15.000/kg",
  },
  {
    name: "FreshPress Menteng",
    distance: "1.2 km",
    rating: 4.9,
    price: "Rp 18.000/kg",
  },
  {
    name: "FreshPress Kemang",
    distance: "2.5 km",
    rating: 4.7,
    price: "Rp 12.000/kg",
  },
];

export default function OutletsPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <TopBar />
      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="p-4 md:p-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input
              className="w-full pl-12 pr-4 py-4 bg-white border border-outline-variant rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="Cari Outlet terdekat..."
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-surface-container rounded-full">
              <Filter className="text-primary w-5 h-5" />
            </button>
          </div>

          <OutletMap />

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Outlet Terdekat</h2>
            <button className="text-primary font-medium text-sm flex items-center gap-1">
              Lihat Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outlets.map((outlet) => (
              <OutletCard key={outlet.name} {...outlet} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
