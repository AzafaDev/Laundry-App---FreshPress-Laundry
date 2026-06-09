"use client";

import { LaundryItemTable } from "@/components/admin/LaundryItemTable";

export default function LaundryItemsPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Laundry Items</h2>
        <p className="text-base text-on-surface-variant">
          Kelola item laundry: nama, satuan, dan harga dasar.
        </p>
      </div>
      <LaundryItemTable />
    </>
  );
}
