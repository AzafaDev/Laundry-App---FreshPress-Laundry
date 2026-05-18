"use client";

import { OutletAdminTable } from "@/components/admin/OutletAdminTable";

export default function AdminOutletsPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Outlets</h2>
        <p className="text-base text-on-surface-variant">
          Kelola outlet, koordinat, dan radius layanan.
        </p>
      </div>
      <OutletAdminTable />
    </>
  );
}
