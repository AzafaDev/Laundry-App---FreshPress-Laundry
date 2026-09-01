"use client";

import { CheckCircle, Clock, Shirt, Star, Truck } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export function LoginBrandingPanel() {
  const { t } = useTranslation();
  const FEATURES = [
    { icon: Truck, text: t("auth.branding.feature1") },
    { icon: Clock, text: t("auth.branding.feature2") },
    { icon: CheckCircle, text: t("auth.branding.feature3") },
    { icon: Star, text: t("auth.branding.feature4") },
  ];
  const STATS = [
    { value: "10K+", label: t("auth.branding.statCustomers") },
    { value: "4.9★", label: t("auth.branding.statRating") },
    { value: "24J", label: t("auth.branding.statDelivery") },
  ];
  return (
    <div className="hidden lg:flex flex-col gap-8 pr-8">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
          <Shirt className="text-white w-8 h-8" />
        </div>
        <span className="text-3xl font-bold text-primary tracking-tight">FreshPress Laundry</span>
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-on-background leading-tight">
          {t("auth.branding.tagline1")} <span className="text-primary">{t("auth.branding.taglineHighlight")}</span>
        </h1>
        <p className="text-lg text-on-surface-variant">
          {t("auth.branding.subtitle")}
        </p>
      </div>

      <ul className="space-y-3">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="flex-shrink-0 bg-primary/10 p-1.5 rounded-lg">
              <Icon className="w-4 h-4 text-primary" />
            </span>
            <span className="text-on-surface-variant text-sm">{text}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-3 gap-4">
        {STATS.map(({ value, label }) => (
          <div key={label} className="bg-primary/5 rounded-2xl p-4 text-center border border-primary/10">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden shadow-md border border-outline-variant h-[220px]">
        <img
          alt="Modern Laundry Service"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD043La3RSeWla_YEgU6WYv-u_bR-aAhl_7Fr6xkX_hQZ0XaFczXYJbSM020YrbLZ635EVGQHHcRDNa5hUwUTl2VeVrnWnM11siMP1M7xW6r1inCEfKRor1DdB19_u2YQrT_tED3VlL2XkGbvQiyC0ARs6UhdF-EP7VzIiuZs17te4XGUXR6KKLJirmEgsMxAB1wKopU6n8gq4vmn7EmfVOdXGUQqAeLB5KExT6qUvPyhDQxeBxYVxc3oJAVqiKKXq0aKrL19tdyrg"
        />
      </div>
    </div>
  );
}
