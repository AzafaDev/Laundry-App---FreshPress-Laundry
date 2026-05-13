"use client";

import { useState } from "react";
import { Shirt } from "lucide-react";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";

const tabs = [
  { label: "Washing", count: 5, active: true },
  { label: "Ironing", count: 4, active: false },
  { label: "Packing", count: 3, active: false },
];

const orders = [
  {
    customer: "Jonathan Miller",
    orderId: "FP-9823",
    weight: "8.5kg",
    service: "Wash & Fold • Delicate",
    dueTime: "2:00 PM Today",
    status: "in-progress" as const,
  },
  {
    customer: "Sarah Jenkins",
    orderId: "FP-9824",
    weight: "12kg",
    service: "Premium Care",
    urgent: true,
    status: "waiting" as const,
  },
  {
    customer: "Michael Chen",
    orderId: "FP-9825",
    weight: "5kg",
    service: "Bed Linens",
    dueTime: "5:00 PM Today",
    status: "waiting" as const,
  },
];

export default function WorkerOrdersPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <WorkerTopBar />
      <WorkerSidebar />

      <main className="lg:ml-72 pb-24 lg:pb-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          {/* Welcome Hero */}
          <section className="mb-6">
            <div className="bg-primary-container text-on-primary-container px-8 py-6 rounded-xl relative overflow-hidden shadow-sm">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-1">Ready for today?</h2>
                <p className="text-base opacity-90">
                  You have 12 orders waiting in the queue.
                </p>
              </div>
              <div className="absolute right-[-20px] top-[-20px] opacity-10">
                <Shirt className="w-[160px] h-[160px]" />
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md -mx-4 px-4 py-2 border-b border-outline-variant mb-4">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap text-sm transition-colors ${
                    activeTab === i
                      ? "bg-primary text-on-primary"
                      : "bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Task Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <OrderCard key={order.orderId} {...order} />
            ))}
            <ProgressCard />
          </div>
        </div>
      </main>
    </div>
  );
}
