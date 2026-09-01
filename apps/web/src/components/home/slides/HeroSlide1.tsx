"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  ctaHref: string;
  startingPrice: string;
}

export function HeroSlide1({ ctaHref, startingPrice }: Props) {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-5">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
              </div>
              <span>{t("home.hero.slide1.rating")}</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
              {t("home.hero.slide1.titleLine1")}{" "}
              <span className="text-primary">{t("home.hero.slide1.titleLine2")}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-7">
              {t("home.hero.slide1.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href={ctaHref} className="bg-primary text-white px-8 py-3.5 rounded-xl text-base font-bold shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 text-center">
                {t("home.hero.slide1.ctaPrimary")}
              </Link>
              <a href="#how-it-works" className="border border-gray-300 text-gray-900 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors text-center">
                {t("home.hero.slide1.ctaSecondary")}
              </a>
            </div>
          </div>

          {/* Image — tinggi adaptif mengikuti sisa ruang */}
          <div className="flex-1 w-full">
            <div className="relative w-full h-56 sm:h-72 lg:h-[400px]">
              <Image
                src="/images/slide-1.png"
                alt="FreshPress Laundry"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-3xl shadow-xl"
                priority
              />
              <div className="absolute bottom-5 left-5 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{t("common.startingFrom")}</p>
                  <p className="text-gray-900 font-bold text-sm">{startingPrice}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
