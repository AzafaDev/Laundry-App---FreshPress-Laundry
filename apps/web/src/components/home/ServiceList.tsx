"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { laundryItemService } from "@/services/laundryItem.service";
import { useTranslation } from "@/i18n/useTranslation";

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(Number(price))
    .replace("IDR", "Rp")
    .trim();

export const ServiceList = ({ id }: { id?: string }) => {
  const { t } = useTranslation();
  const CARD_META = [
    { emoji: "🧺", tag: t("home.services.tagPopular"), tagColor: "bg-primary text-white" },
    { emoji: "👔", tag: t("home.services.tagEssential"), tagColor: "bg-surface-container-high text-on-surface-variant" },
    { emoji: "✨", tag: t("home.services.tagPremium"), tagColor: "bg-tertiary-container text-on-tertiary-container" },
    { emoji: "⚡", tag: t("home.services.tagExpress"), tagColor: "bg-secondary/10 text-secondary" },
  ];
  const user = useAuthStore((s) => s.user);
  const ctaHref = user ? "/customer/pickup" : "/register";
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["laundry-items-public"],
    queryFn: () => laundryItemService.listForCustomer(),
  });

  // Mix kiloan (kg) and satuan (pcs) items, capped at 4 cards
  const kgItems = items.filter((item) => item.unit === "kg");
  const pcsItems = items.filter((item) => item.unit !== "kg");
  const displayItems: typeof items = [];
  let ki = 0;
  let pi = 0;
  while (displayItems.length < 4 && (ki < kgItems.length || pi < pcsItems.length)) {
    if (ki < kgItems.length) displayItems.push(kgItems[ki++]);
    if (displayItems.length < 4 && pi < pcsItems.length) displayItems.push(pcsItems[pi++]);
  }

  return (
    <section id={id} className="bg-surface-container-low py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="text-primary font-bold uppercase tracking-widest text-xs">
            {t("home.services.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
            {t("home.services.title")}
          </h2>
          <p className="text-gray-500 mt-3">
            {t("home.services.description")}
          </p>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse h-56"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayItems.map((item, i) => {
              const meta = CARD_META[i % CARD_META.length];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col"
                >
                  <span className="text-4xl mb-4 block">{meta.emoji}</span>
                  <span
                    className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 ${meta.tagColor}`}
                  >
                    {meta.tag}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-500 flex-1 mb-5">{item.description}</p>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-2xl font-extrabold text-primary">
                      {formatPrice(item.base_price)}
                    </span>
                    <span className="text-sm text-gray-400">/{item.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href={ctaHref}
            className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md"
          >
            {t("home.services.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
};
