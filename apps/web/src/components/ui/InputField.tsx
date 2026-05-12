import React from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface InputProps {
  label: string;
  icon: React.ReactNode; // diubah dari string ke ReactNode
  type: string;
  placeholder: string;
  id?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const InputField = ({
  label,
  icon,
  type,
  placeholder,
  id,
  rightIcon,
  onRightIconClick,
}: InputProps) => {
  const inputId = id || label.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-on-surface-variant"
      >
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary">
          {icon}
        </span>
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-base"
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            aria-label="Toggle visibility"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
};
