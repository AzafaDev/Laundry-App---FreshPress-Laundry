"use client";

import { Star } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {[...Array(count)].map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

export const TestimonialsSection = ({ id }: { id?: string }) => {
  const { t } = useTranslation();

  const reviews = [
    {
      name: "Siti Rahayu",
      location: "Jakarta Selatan",
      rating: 5,
      text: t("home.testimonials.review1Text"),
      initial: "SR",
    },
    {
      name: "Budi Santoso",
      location: "Bandung",
      rating: 5,
      text: t("home.testimonials.review2Text"),
      initial: "BS",
    },
    {
      name: "Dewi Lestari",
      location: "Surabaya",
      rating: 5,
      text: t("home.testimonials.review3Text"),
      initial: "DL",
    },
  ];

  return (
  <section id={id} className="bg-surface-container-low py-20 px-4 md:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-primary font-bold uppercase tracking-widest text-xs">
          {t("home.testimonials.eyebrow")}
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
          {t("home.testimonials.title")}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Stars count={5} />
          <span className="text-gray-500 text-sm font-medium">
            {t("home.testimonials.ratingSummary")}
          </span>
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.name}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <Stars count={review.rating} />
            <p className="text-gray-600 text-sm mt-4 mb-6 leading-relaxed">
              &ldquo;{review.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {review.initial}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                <p className="text-xs text-gray-400">{review.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};
