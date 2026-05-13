"use client";

import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ServiceList } from "@/components/home/ServiceList";
import { ProcessSection } from "@/components/home/ProcessSection";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function Home() {
  const { permissionDenied } = useGeolocation();

  return (
    <div className="min-h-screen">
      <Navbar />
      {permissionDenied && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-700" role="alert">
          Akses lokasi ditolak. Beberapa fitur seperti pencarian outlet terdekat mungkin terbatas.
        </div>
      )}
      <main className="pb-20 lg:pb-0">
        <Hero />
        <ServiceList />
        <ProcessSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
