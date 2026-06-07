"use client";

import { ShoppingBag, Truck } from "lucide-react";

export function TaskTypeIcon({ type }: { type: "pickup" | "delivery" }) {
  const Icon = type === "pickup" ? ShoppingBag : Truck;
  const bgColor = type === "pickup" ? "bg-tertiary/10" : "bg-primary/10";
  const textColor = type === "pickup" ? "text-tertiary" : "text-primary";
  return (
    <div className={`p-2 rounded-full ${bgColor} ${textColor}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}
