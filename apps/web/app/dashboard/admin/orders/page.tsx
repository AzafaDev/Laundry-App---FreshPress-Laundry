"use client";

import { OrderDataTable } from "@/components/orders/OrderDataTable";

export default function AdminOrdersPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Orders</h2>
        <p className="text-base text-on-surface-variant">
          Lacak dan kelola semua permintaan layanan laundry.
        </p>
      </div>
      <OrderDataTable />
    </>
  );
}
