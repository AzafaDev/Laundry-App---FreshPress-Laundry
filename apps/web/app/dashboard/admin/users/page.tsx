"use client";

import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-base text-on-surface-variant">
          Kelola super admin, outlet admin, worker, driver, dan customer.
        </p>
      </div>
      <UserTable />
    </>
  );
}
