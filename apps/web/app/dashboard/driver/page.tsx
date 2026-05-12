"use client";

import { Truck, Package, Plus } from "lucide-react";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { MapPreviewCard } from "@/components/dashboard/MapPreviewCard";
import { StatusStepper } from "@/components/dashboard/StatusStepper";

export default function DriverDashboardPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <DriverTopBar />
      <DriverSidebar />

      <main className="lg:ml-72 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Welcome */}
          <section className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">
              Driver Dashboard
            </h2>
            <p className="text-base text-on-surface-variant">
              You have 5 tasks scheduled for today.
            </p>
          </section>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pickup Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <Truck className="text-primary w-6 h-6" />
                  Pickup
                </h3>
                <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded-full text-xs font-medium">
                  3 Pending
                </span>
              </div>

              <TaskCard
                customer="Sarah Mitchell"
                address="124 Oak Street, Apt 4B"
                service="Wash & Fold"
                type="pickup"
              />
              <TaskCard
                customer="David Chen"
                address="882 Skyline Blvd, Unit 12"
                service="Dry Clean"
                type="pickup"
              />
            </section>

            {/* Delivery Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <Package className="text-secondary w-6 h-6" />
                  Delivery
                </h3>
                <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-xs font-medium">
                  2 Ready
                </span>
              </div>

              <TaskCard
                customer="Emily Rodriguez"
                address="45 Pine Terrace"
                service="Premium Silk"
                type="delivery"
                statusMessage="Order Ready: Washing & Drying Complete"
              />

              <MapPreviewCard />
            </section>
          </div>

          {/* Shift Progress Stepper */}
          <StatusStepper />
        </div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <button className="fixed bottom-24 right-4 md:hidden lg:bottom-12 lg:right-12 w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
