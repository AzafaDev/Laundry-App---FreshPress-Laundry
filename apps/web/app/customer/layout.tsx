"use client";

import { useCallback, type ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { useCustomerNotificationSocket } from "@/hooks/useCustomerNotificationSocket";
import { socketToast } from "@/lib/socketToast";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const handleNotification = useCallback(
    (data: { title: string; body: string }) => socketToast(data.title, data.body),
    [],
  );
  useCustomerNotificationSocket(handleNotification);

  return (
    <>
      <div className="pb-20 lg:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
