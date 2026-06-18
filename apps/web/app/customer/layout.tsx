import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="pb-20 lg:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
