"use client";

import { useLocaleStore } from "@/stores/localeStore";

const FlagID = () => (
  <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
    <rect width="3" height="1" fill="#CE1126" />
    <rect y="1" width="3" height="1" fill="#FFFFFF" />
  </svg>
);

const FlagGB = () => (
  <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
    <rect width="60" height="30" fill="#00247D" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#CF142B" strokeWidth="2" />
    <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10" />
    <path d="M30,0 V30 M0,15 H60" stroke="#CF142B" strokeWidth="6" />
  </svg>
);

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocaleStore();

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => setLocale("id")}
        aria-pressed={locale === "id"}
        aria-label="Bahasa Indonesia"
        title="Bahasa Indonesia"
        className={`flex items-center justify-center w-8 h-8 rounded-full overflow-hidden transition-all shrink-0 ${
          locale === "id"
            ? "ring-2 ring-primary ring-offset-2 scale-100"
            : "opacity-40 grayscale scale-90 hover:opacity-70 hover:grayscale-0"
        }`}
      >
        <FlagID />
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label="English"
        title="English"
        className={`flex items-center justify-center w-8 h-8 rounded-full overflow-hidden transition-all shrink-0 ${
          locale === "en"
            ? "ring-2 ring-primary ring-offset-2 scale-100"
            : "opacity-40 grayscale scale-90 hover:opacity-70 hover:grayscale-0"
        }`}
      >
        <FlagGB />
      </button>
    </div>
  );
};
