import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { OrderDataTable } from "@/components/orders/OrderDataTable";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrderStatsSummary } from "@/components/orders/OrderStatsSummary";

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <TopBar />
      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs text-on-surface-variant mb-1">
            <span>Admin</span>
            <ChevronRight className="w-[14px] h-[14px]" />
            <span className="text-primary font-bold">Orders</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Order Management</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Track, manage, and process all laundry service requests.
          </p>

          <OrderStatsSummary />
          <OrderFilters />
          <OrderDataTable />
        </div>
      </main>
    </div>
  );
}
