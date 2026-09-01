"use client";

import { CheckCircle, Gift, Headphones, Shield, Shirt } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export function RegisterBrandingPanel() {
  const { t } = useTranslation();
  const PERKS = [
    { icon: Gift, title: t("auth.registerBranding.freePickupTitle"), desc: t("auth.registerBranding.freePickupDesc"), color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
    { icon: CheckCircle, title: t("auth.registerBranding.cleanGuaranteeTitle"), desc: t("auth.registerBranding.cleanGuaranteeDesc"), color: "bg-blue-50 border-blue-100 text-blue-600" },
    { icon: Shield, title: t("auth.registerBranding.secureTitle"), desc: t("auth.registerBranding.secureDesc"), color: "bg-violet-50 border-violet-100 text-violet-600" },
    { icon: Headphones, title: t("auth.registerBranding.supportTitle"), desc: t("auth.registerBranding.supportDesc"), color: "bg-amber-50 border-amber-100 text-amber-600" },
  ];
  return (
    <div className="hidden lg:flex flex-col gap-8 pr-8 pt-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/30">
          <Shirt className="text-white w-7 h-7" />
        </div>
        <span className="text-2xl font-bold text-primary tracking-tight">FreshPress Laundry</span>
      </div>

      <div>
        <h1 className="text-4xl font-bold text-on-background leading-tight mb-3">
          {t("auth.registerBranding.headline1")} <span className="text-primary">{t("auth.registerBranding.headlineHighlight")}</span>
        </h1>
        <p className="text-on-surface-variant">
          {t("auth.registerBranding.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PERKS.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className={`rounded-2xl border p-4 flex flex-col gap-2 ${color}`}>
            <Icon className="w-5 h-5" />
            <p className="font-bold text-sm text-on-surface">{title}</p>
            <p className="text-xs text-on-surface-variant leading-snug">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
        <div className="flex gap-1 mb-2">
          {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
        </div>
        <p className="text-on-surface-variant text-sm italic">
          {t("auth.registerBranding.testimonial")}
        </p>
        <p className="text-xs font-bold text-on-surface mt-3">{t("auth.registerBranding.testimonialAuthor")}</p>
      </div>
    </div>
  );
}
