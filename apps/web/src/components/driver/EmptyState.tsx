"use client";

import { ShoppingBag, Truck } from "lucide-react";

export function EmptyState({ type }: { type: "pickup" | "delivery" }) {
  const Icon = type === "pickup" ? ShoppingBag : Truck;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-outline-variant/20 flex items-center justify-center mb-3">
        <Icon className="w-8 h-8 text-outline" />
      </div>
      <p className="text-sm font-medium text-on-surface-variant">
        Tidak ada {type === "pickup" ? "pickup" : "delivery"} tersedia
      </p>
      <p className="text-xs text-outline mt-1">Belum ada task masuk</p>
    </div>
  );
}
