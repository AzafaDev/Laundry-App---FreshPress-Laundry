"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Truck, HeadphonesIcon, MapPin } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const usps = [
  { icon: Truck, label: "Gratis jemput & antar" },
  { icon: HeadphonesIcon, label: "Dukungan 24/7" },
  { icon: MapPin, label: "Lacak pesanan real-time" },
];

export const Hero = () => {
  const user = useAuthStore((s) => s.user);
  const ctaHref = user ? "/customer/pickup" : "/register";

  return (
    <section className="bg-white overflow-hidden">
      {/* Main hero */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-0">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>
              <span>200.000+ ulasan di seluruh Indonesia</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
              Laundry & Dry Cleaning{" "}
              <span className="text-primary">Selesai 24 Jam</span>
            </h1>

            <p className="text-lg text-gray-500 mb-8">
              Jemput dari rumah, cuci profesional oleh tenaga ahli kami, lalu
              antar kembali ke depan pintu Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href={ctaHref}
                className="bg-primary text-white px-8 py-4 rounded-xl text-base font-bold shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 text-center"
              >
                Jadwalkan Penjemputan
              </Link>
              <a
                href="#how-it-works"
                className="border border-gray-300 text-gray-900 px-8 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cara Kerja
              </a>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="flex-1 w-full relative">
            <div className="relative h-72 sm:h-96 lg:h-[480px] w-full">
              <Image
                src="/images/slide-1.png"
                alt="FreshPress Laundry Service"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-3xl shadow-xl"
                priority
              />
              {/* Floating price card */}
              <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">✓</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Mulai dari</p>
                  <p className="text-gray-900 font-bold text-sm">Rp 10.000 / kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* USP strip */}
      <div className="bg-primary mt-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-center gap-6 sm:gap-12">
          {usps.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white justify-center">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
