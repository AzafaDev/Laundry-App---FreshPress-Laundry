"use client";

import Link from "next/link";
import { Scale, Shirt } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  ctaHref: string;
  kiloanPrice: string;
  satuanPrice: string;
}

export function HeroSlide2({ ctaHref, kiloanPrice, satuanPrice }: Props) {
  const { t } = useTranslation();
  const priceMap = { kiloan: kiloanPrice, satuan: satuanPrice };

  const SERVICES = [
    {
      icon: Scale,
      type: t("home.hero.slide2.kiloanType"),
      tag: t("home.hero.slide2.kiloanTag"),
      tagColor: "bg-primary text-white",
      description: t("home.hero.slide2.kiloanDescription"),
      features: [
        t("home.hero.slide2.kiloanFeature1"),
        t("home.hero.slide2.kiloanFeature2"),
        t("home.hero.slide2.kiloanFeature3"),
      ],
      priceKey: "kiloan" as const,
      cardBg: "bg-white border-primary/30 shadow-md",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: Shirt,
      type: t("home.hero.slide2.satuanType"),
      tag: t("home.hero.slide2.satuanTag"),
      tagColor: "bg-purple-100 text-purple-700",
      description: t("home.hero.slide2.satuanDescription"),
      features: [
        t("home.hero.slide2.satuanFeature1"),
        t("home.hero.slide2.satuanFeature2"),
        t("home.hero.slide2.satuanFeature3"),
      ],
      priceKey: "satuan" as const,
      cardBg: "bg-white border-purple-200 shadow-md",
      iconBg: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-primary/5 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            {t("home.hero.slide2.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            {t("home.hero.slide2.titleLine1")} <span className="text-primary">{t("home.hero.slide2.titleLine2")}</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
            {t("home.hero.slide2.description")}
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {SERVICES.map(({ icon: Icon, type, tag, tagColor, description, features, priceKey, cardBg, iconBg }) => (
            <div key={type} className={`rounded-2xl border-2 p-5 flex flex-col gap-3 ${cardBg}`}>
              <div className="flex items-start justify-between gap-2">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tagColor}`}>{tag}</span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-gray-900 mb-0.5">{type}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{description}</p>
              </div>

              <ul className="space-y-1">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <span className="w-3.5 h-3.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[9px] font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">{t("common.startingFrom")}</p>
                <p className="text-xl font-extrabold text-primary">{priceMap[priceKey]}</p>
              </div>

              <Link
                href={ctaHref}
                className="w-full text-center bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all"
              >
                {t("home.hero.slide2.cta")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
