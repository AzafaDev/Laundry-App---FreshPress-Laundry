import { Search, Filter, CalendarDays, Plus } from "lucide-react";

export const OrderFilters = () => (
  <div className="bg-surface border border-outline-variant rounded-t-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
      <input
        className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
        placeholder="Search by Order ID or Customer..."
      />
    </div>
    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
      <button className="flex items-center gap-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low">
        <Filter className="w-4 h-4" />
        Status
      </button>
      <button className="flex items-center gap-1 px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low">
        <CalendarDays className="w-4 h-4" />
        Date Range
      </button>
      <button className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm hover:opacity-90">
        <Plus className="w-4 h-4" />
        New Order
      </button>
    </div>
  </div>
);
