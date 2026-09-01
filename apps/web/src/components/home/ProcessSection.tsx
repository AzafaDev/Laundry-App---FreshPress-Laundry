// apps/web/src/components/home/ProcessSection.tsx
"use client";

import { useTranslation } from "@/i18n/useTranslation";

export const ProcessSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: "01",
      title: t("home.process.step1Title"),
      desc: t("home.process.step1Desc"),
      color: "bg-primary/10 text-primary",
    },
    {
      number: "02",
      title: t("home.process.step2Title"),
      desc: t("home.process.step2Desc"),
      color: "bg-secondary/10 text-secondary",
    },
    {
      number: "03",
      title: t("home.process.step3Title"),
      desc: t("home.process.step3Desc"),
      color: "bg-tertiary/10 text-tertiary",
    },
  ];

  return (
  <section id="how-it-works" className="bg-surface-container-low py-20 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-14">
        <span className="text-primary font-bold uppercase tracking-widest text-xs">
          {t("home.process.eyebrow")}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
          {t("home.process.title")}
        </h2>
        <p className="text-gray-500 mt-3">
          {t("home.process.description")}
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-start">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl font-extrabold ${step.color}`}
            >
              {step.number}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};
