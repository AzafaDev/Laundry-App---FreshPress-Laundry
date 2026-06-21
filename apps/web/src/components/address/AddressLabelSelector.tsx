"use client";

import { Plus } from "lucide-react";

const ADDRESS_LABELS = ["Rumah", "Kantor", "Apartemen"] as const;

interface Props {
  label: string;
  customLabel: string;
  showCustomInput: boolean;
  onSelectLabel: (label: string) => void;
  onCustomLabelChange: (value: string) => void;
  onSelectCustom: () => void;
}

export function AddressLabelSelector({ label, customLabel, showCustomInput, onSelectLabel, onCustomLabelChange, onSelectCustom }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">Tandai Sebagai:</p>
      <div className="flex flex-wrap gap-2">
        {ADDRESS_LABELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onSelectLabel(l)}
            className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${label === l ? "border-primary text-primary bg-primary/5" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}
          >
            {l}
          </button>
        ))}
        <button
          type="button"
          onClick={onSelectCustom}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-1 ${label === "custom" ? "border-primary text-primary bg-primary/5" : "border-gray-300 text-gray-600 hover:border-gray-400"}`}
        >
          <Plus className="w-3.5 h-3.5" />Lainnya
        </button>
      </div>
      {showCustomInput && (
        <input
          type="text"
          value={customLabel}
          onChange={(e) => onCustomLabelChange(e.target.value)}
          placeholder="Nama label kustom..."
          className="mt-3 w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300"
        />
      )}
    </div>
  );
}
