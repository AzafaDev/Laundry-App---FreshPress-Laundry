"use client";

import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ServiceList } from "@/components/home/ServiceList";
import { PriceCalculator } from "@/components/home/PriceCalculator";
import { ProcessSection } from "@/components/home/ProcessSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { FooterCTA } from "@/components/home/FooterCTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-clip">
      <Navbar />
      <main className="pb-20 lg:pb-0">
        <Hero />
        <ServiceList id="services" />
        <PriceCalculator id="calculator" />
        <ProcessSection />
        <BenefitsSection />
        <TestimonialsSection id="testimonials" />
        <FAQSection id="faq" />
        <FooterCTA />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

