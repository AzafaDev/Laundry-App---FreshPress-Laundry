// apps/web/src/components/home/Hero.tsx
"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";

const slides = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCW_6uxG6NVxTRRBmmciRFNZ1qMOWFLme8_50_-ame8pz98HPgrCetFRic7johkqbhZUZ1VAaNqw1cxFKPh9GrTssrSFZWJZf1GwDvkSViaJvHgPPx5hGG3ksixD4T0gYuLq_mJZykZybR015HIa6U40RQ9Lox2J6XP0ofCXIMAUl5jfdX5cXqjpSmtUlxPR-XFkdCrz_j6R6lvJ1jMFAXu0syHajnmaWD0eBWLSgweN1pPwwlc2B8kEglIE5jTBKHKEaM2fZhMPik",
    headline: "Laundry Hari Ini, Bersih Esok Pagi.",
    sub: "Nikmati kemudahan layanan cuci premium langsung dari pintu rumah Anda.",
    cta: "Pesan Sekarang",
  },
  {
    color: "bg-primary-container",
    textColor: "text-on-primary-container",
    headline: "Diskon 20% Pengguna Baru",
    sub: "Gunakan kode FRESHFIRST untuk pesanan pertama Anda.",
    cta: "Klaim Promo",
    badge: "PROMO TERBATAS",
  },
  {
    color: "bg-secondary",
    textColor: "text-white",
    headline: "Layanan Express 6 Jam Selesai",
    sub: "Butuh pakaian bersih segera? Layanan kilat kami siap membantu Anda.",
    cta: "Cek Layanan",
  },
];

const HeroCta = ({ label, className }: { label: string; className?: string }) => {
  const user = useAuthStore((s) => s.user);
  const href = user ? "/dashboard" : "/register";
  return (
    <Link
      href={href}
      className={className ?? "bg-primary text-on-primary px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-transform inline-block"}
    >
      {label || "Pesan Sekarang"}
    </Link>
  );
};

export const Hero = () => (
  <section className="relative bg-surface-container-low ">
    <Swiper
      modules={[Autoplay, EffectFade]}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      effect="fade"
      loop
      className="h-[500px] md:h-[600px] w-full"
      aria-label="Promo bergambar"
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i}>
          <div className={`relative h-full w-full ${slide.color || ""}`}>
            {slide.image ? (
              <>
                <Image
                  alt={`Slide ${i + 1}`}
                  className="object-cover"
                  fill
                  priority={i === 0}
                  src={slide.image}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-6">
                  <div className="max-w-3xl">
                    <h1 className="text-white font-bold text-4xl md:text-6xl mb-4">
                      Laundry Hari Ini, <br />
                      <span className="text-inverse-primary">
                        Bersih Esok Pagi.
                      </span>
                    </h1>
                    <p className="text-white/90 text-lg mb-8">{slide.sub}</p>
                    <HeroCta label={slide.cta} />
                  </div>
                </div>
              </>
            ) : (
              <div
                className={`absolute inset-0 flex items-center justify-center ${slide.color}`}
              >
                <div className="max-w-3xl text-center px-6">
                  {slide.badge && (
                    <span className="bg-tertiary-container text-white px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
                      {slide.badge}
                    </span>
                  )}
                  <h2
                    className={`text-4xl md:text-6xl font-bold mb-4 ${slide.textColor || "text-white"}`}
                  >
                    {slide.headline}
                  </h2>
                  <p className="text-white/80 text-lg mb-8">{slide.sub}</p>
                  <HeroCta
                    label={slide.cta}
                    className="bg-white text-secondary px-8 py-4 rounded-lg text-xl font-semibold shadow-lg hover:scale-105 transition-transform inline-block"
                  />
                </div>
              </div>
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>

    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20 hidden md:block">
      <div className="bg-surface-container-low border border-outline rounded-2xl p-1 flex items-center ">
        <MapPin className="ml-3 mr-2 text-outline w-5 h-5 flex-shrink-0" />
        <input
          className="flex-1 bg-transparent border-none focus:ring-0 text-base px-2 py-3"
          placeholder="Cari outlet terdekat..."
          type="text"
        />
        <button className="bg-primary text-white text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0">
          Cari
        </button>
      </div>
    </div>
  </section>
);
