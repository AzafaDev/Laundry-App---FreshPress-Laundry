"use client";

import { ShoppingBag, Truck } from "lucide-react";

export function EmptyState({
  type,
  nextReleaseAt,
}: {
  type: "pickup" | "delivery";
  nextReleaseAt?: string | null;
}) {
  const Icon = type === "pickup" ? ShoppingBag : Truck;

  const subtext =
    type === "pickup" && nextReleaseAt
      ? `Task berikutnya tersedia pukul ${new Date(nextReleaseAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
      : "Belum ada task masuk";

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-outline-variant/20 flex items-center justify-center mb-3">
        <Icon className="w-8 h-8 text-outline" />
      </div>
      <p className="text-sm font-medium text-on-surface-variant">
        Tidak ada {type === "pickup" ? "pickup" : "delivery"} tersedia
      </p>
      <p className="text-xs text-outline mt-1">{subtext}</p>
    </div>
  );
}
