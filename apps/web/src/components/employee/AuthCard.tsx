import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.22)", animation: "card-enter 0.4s ease-out" }}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: "linear-gradient(90deg, #00685f 0%, #89f5e7 60%, #00685f 100%)" }}
      />
      <div className="p-8">{children}</div>
    </div>
  );
}
