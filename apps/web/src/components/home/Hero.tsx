"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, HeadphonesIcon, MapPin, Truck } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { laundryItemService } from "@/services/laundryItem.service";
import { formatRupiah } from "@/utils/formatPrice";
import { useTranslation } from "@/i18n/useTranslation";
import { HeroSlide1 } from "./slides/HeroSlide1";
import { HeroSlide2 } from "./slides/HeroSlide2";
import { HeroSlide3 } from "./slides/HeroSlide3";

const SLIDE_COUNT = 3;
const INTERVAL_MS = 5000;

// Navbar: h-14 (3.5rem) mobile, h-16 (4rem) md+
const HERO_HEIGHT = "h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]";

export const Hero = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const ctaHref = user ? "/customer/pickup" : "/customer/register";

  const USPS = [
    { icon: Truck, label: t("home.hero.uspFreeDelivery") },
    { icon: HeadphonesIcon, label: t("home.hero.uspSupport") },
    { icon: MapPin, label: t("home.hero.uspTracking") },
  ];

  const { data: laundryItems = [] } = useQuery({
    queryKey: ["customer", "laundry-items"],
    queryFn: laundryItemService.listForCustomer,
  });

  console.log(laundryItems)
  const cheapest = (unit: string) =>
    laundryItems
      .filter((i) => i.unit === unit)
      .reduce<(typeof laundryItems)[number] | null>(
        (acc, item) => (!acc || Number(item.base_price) < Number(acc.base_price) ? item : acc),
        null,
      );

  const cheapestKg  = cheapest("kg");
  const cheapestPcs = cheapest("pcs") ?? cheapest("buah") ?? cheapest("satuan");

  const startingPrice = cheapestKg ? `${formatRupiah(Number(cheapestKg.base_price))} / kg`  : "Rp 7.000 / kg";
  const kiloanPrice   = cheapestKg ? `${formatRupiah(Number(cheapestKg.base_price))} / kg`  : "Rp 7.000 / kg";
  const satuanPrice   = cheapestPcs ? `${formatRupiah(Number(cheapestPcs.base_price))} / pcs` : "Rp 5.000 / pcs";

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % SLIDE_COUNT), INTERVAL_MS);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const handleNav = (dir: -1 | 1) => {
    setCurrent((c) => (c + dir + SLIDE_COUNT) % SLIDE_COUNT);
    startTimer();
  };

  return (
    // Section mengisi tepat satu layar dikurangi tinggi navbar
    <section className={`${HERO_HEIGHT} flex flex-col overflow-hidden bg-white`}>

      {/* ── Carousel (flex-1 agar mengisi sisa ruang) ── */}
      <div
        className="flex-1 min-h-0 relative overflow-hidden"
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
        onMouseLeave={startTimer}
      >
        {/* Track */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          <div className="min-w-full h-full"><HeroSlide1 ctaHref={ctaHref} startingPrice={startingPrice} /></div>
          <div className="min-w-full h-full"><HeroSlide2 ctaHref={ctaHref} kiloanPrice={kiloanPrice} satuanPrice={satuanPrice} /></div>
          <div className="min-w-full h-full"><HeroSlide3 ctaHref={ctaHref} /></div>
        </div>

        {/* Panah kiri */}
        <button
          onClick={() => handleNav(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:text-primary transition-colors z-10"
          aria-label={t("home.hero.prevSlide")}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Panah kanan */}
        <button
          onClick={() => handleNav(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-700 hover:text-primary transition-colors z-10"
          aria-label={t("home.hero.nextSlide")}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Dot indicators ── */}
      <div className="shrink-0 flex justify-center gap-2 py-3 bg-white">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); startTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── USP strip ── */}
      <div className="shrink-0 bg-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col sm:flex-row justify-center gap-5 sm:gap-12">
          {USPS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white justify-center">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
