import React from "react";

interface RoleProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const RoleButton = ({ icon, label, active, onClick }: RoleProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex flex-col items-center justify-center p-md border rounded-lg transition-all ${
      active
        ? "border-primary bg-surface-container text-primary scale-95"
        : "border-outline-variant hover:bg-surface-container-low"
    }`}
  >
    <span className="mb-1">{icon}</span>
    <span className="text-[12px] font-medium">{label}</span>
  </button>
);
