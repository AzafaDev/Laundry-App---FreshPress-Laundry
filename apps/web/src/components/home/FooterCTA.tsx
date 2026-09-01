"use client"
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/i18n/useTranslation";


export const FooterCTA = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const ctaHref = user ? "/customer/pickup" : "/customer/register";

  return (
    <section className="bg-primary py-20 px-4 md:px-8 text-center">
      <div className="max-w-[48rem] mx-auto">
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">
          {t("home.footerCta.eyebrow")}
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          {t("home.footerCta.title")}
        </h2>
        <p className="text-white/80 text-base mb-8">
          {t("home.footerCta.description")}
        </p>
        <Link
          href={ctaHref}
          className="inline-block bg-white text-primary px-10 py-4 rounded-xl font-bold text-base shadow-md hover:bg-gray-100 transition-colors"
        >
          {t("home.footerCta.cta")}
        </Link>
      </div>
    </section>
  );
};
