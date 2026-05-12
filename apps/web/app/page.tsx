import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Hero } from "@/components/home/Hero";
import { ServiceList } from "@/components/home/ServiceList";
import { ProcessSection } from "@/components/home/ProcessSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-20 lg:pb-0">
        <Hero />
        <ServiceList />
        <ProcessSection />
      </main>
      <BottomNav />
    </div>
  );
}
