"use client";

import { WorkShiftTable } from "@/components/admin/WorkShiftTable";

export default function AdminShiftsPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Work Shift Management</h2>
        <p className="text-base text-on-surface-variant">
          Kelola nama shift dan jam kerja. Gunakan tabel User untuk assign shift ke karyawan.
        </p>
      </div>
      <WorkShiftTable />
    </>
  );
}
