import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface AuthInputProps {
  id: string;
  type?: string;
  placeholder: string;
  icon: ReactNode;
  registration: UseFormRegisterReturn;
  rightSlot?: ReactNode;
}

export function AuthInput({ id, type = "text", placeholder, icon, registration, rightSlot }: AuthInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm placeholder:text-gray-400 transition-all"
      />
      {rightSlot && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightSlot}
        </span>
      )}
    </div>
  );
}
