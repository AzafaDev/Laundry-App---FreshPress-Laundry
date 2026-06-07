"use client";

import { ShoppingBag, Truck, Lock } from "lucide-react";
import { TaskSkeleton } from "./TaskSkeleton";

export function LockedTaskPreview() {
  return (
    <div className="relative">
      <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 mb-4 pointer-events-none select-none opacity-50">
        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary text-on-primary text-sm font-semibold">
          <ShoppingBag className="w-4 h-4" />
          <span>Pickup</span>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-on-surface-variant text-sm font-semibold">
          <Truck className="w-4 h-4" />
          <span>Delivery</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 blur-[2px] pointer-events-none select-none">
        <TaskSkeleton />
        <TaskSkeleton className="hidden md:block" />
        <TaskSkeleton className="hidden lg:block" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 rounded-xl backdrop-blur-[1px]">
        <div className="flex flex-col items-center gap-3 px-6 py-5 bg-surface border border-outline-variant rounded-2xl shadow-lg text-center">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Check-in dulu</p>
            <p className="text-xs text-on-surface-variant mt-0.5">untuk melihat task yang tersedia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
