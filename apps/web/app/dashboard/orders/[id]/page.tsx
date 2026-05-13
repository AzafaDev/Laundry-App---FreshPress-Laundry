"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { GarmentChecklist } from "@/components/orders/GarmentChecklist";
import { HandlingInstructions } from "@/components/orders/HandlingInstructions";
import { OrderProgressStepper } from "@/components/orders/OrderProgressStepper";
import { CustomerProfileCard } from "@/components/orders/CustomerProfileCard";
import { BypassModal } from "@/components/orders/BypassModal";

export default function OrderDetailPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <TopBar />
      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button className="p-1 hover:bg-surface-container-high rounded-full">
                  <ArrowLeft className="text-on-surface-variant w-5 h-5" />
                </button>
                <span className="text-sm text-on-surface-variant">
                  Order #FP-88291
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Standard Wash & Fold
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-sm font-bold">
                Washing
              </span>
              <span className="text-xs text-on-surface-variant">
                Updated 12m ago
              </span>
            </div>
          </div>

          {/* Grid utama */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom kiri: Checklist + Instruksi */}
            <div className="lg:col-span-2 space-y-6">
              <GarmentChecklist onBypass={() => setModalOpen(true)} />
              <HandlingInstructions />
            </div>

            {/* Kolom kanan: Stepper + Customer */}
            <div className="space-y-6">
              <OrderProgressStepper />
              <CustomerProfileCard />
            </div>
          </div>
        </div>
      </main>

      <BypassModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
