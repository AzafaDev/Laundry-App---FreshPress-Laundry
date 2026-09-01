"use client";

import Image from "next/image";
import { ShieldCheck, Clock, RefreshCw, Leaf } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export const BenefitsSection = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: ShieldCheck,
      title: t("home.benefits.safeTitle"),
      desc: t("home.benefits.safeDesc"),
    },
    {
      icon: Clock,
      title: t("home.benefits.experienceTitle"),
      desc: t("home.benefits.experienceDesc"),
    },
    {
      icon: RefreshCw,
      title: t("home.benefits.premiumTitle"),
      desc: t("home.benefits.premiumDesc"),
    },
    {
      icon: Leaf,
      title: t("home.benefits.ecoTitle"),
      desc: t("home.benefits.ecoDesc"),
    },
  ];

  return (
  <section className="bg-white py-20 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-14">
        {/* Left: image */}
        <div className="flex-1 w-full">
          <div className="relative h-80 lg:h-[460px] w-full">
            <Image
              src="/images/laundry-process.jpg"
              alt={t("home.benefits.imageAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover rounded-3xl shadow-xl"
            />
          </div>
        </div>

        {/* Right: benefits list */}
        <div className="flex-1">
          <span className="text-primary font-bold uppercase tracking-widest text-xs">
            {t("home.benefits.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-8">
            {t("home.benefits.title")}
          </h2>
          <div className="space-y-6">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};
