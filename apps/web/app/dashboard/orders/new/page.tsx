"use client";

import { useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";
import { NewOrderStepper } from "@/components/orders/NewOrderStepper";
import { ServiceSelection } from "@/components/orders/ServiceSelection";
import { WeightSelector } from "@/components/orders/WeightSelector";
import { SchedulePicker } from "@/components/orders/SchedulePicker";
import { PromoCard } from "@/components/orders/PromoCard";

export default function NewOrderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState("wash-and-fold");
  const [weight, setWeight] = useState(15);
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedTime, setSelectedTime] = useState("10:00 AM - 12:00 PM");

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <TopBar />
      <main className="lg:pl-72 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <NewOrderStepper currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
            {/* Kolom kiri: langkah pemesanan */}
            <div className="lg:col-span-8 space-y-6">
              {currentStep === 1 && (
                <ServiceSelection
                  selected={selectedService}
                  onSelect={setSelectedService}
                  onNext={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 2 && (
                <WeightSelector
                  weight={weight}
                  onChange={setWeight}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <SchedulePicker
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  onBack={() => setCurrentStep(2)}
                />
              )}
            </div>

            {/* Kolom kanan: ringkasan order */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <OrderSummaryCard service={selectedService} weight={weight} />
              <PromoCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
