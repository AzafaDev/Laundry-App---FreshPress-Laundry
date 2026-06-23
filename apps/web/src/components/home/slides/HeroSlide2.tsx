"use client";

import Link from "next/link";
import { Scale, Shirt } from "lucide-react";

interface Props {
  ctaHref: string;
  kiloanPrice: string;
  satuanPrice: string;
}

const SERVICES = [
  {
    icon: Scale,
    type: "Cuci Kiloan",
    tag: "Paling Populer",
    tagColor: "bg-primary text-white",
    description: "Cocok untuk cucian sehari-hari. Dihitung per kilogram, hemat dan praktis.",
    features: ["Cuci + Setrika", "Proses 24 Jam", "Gratis Pickup & Antar"],
    priceKey: "kiloan" as const,
    cardBg: "bg-white border-primary/30 shadow-md",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: Shirt,
    type: "Cuci Satuan",
    tag: "Perawatan Khusus",
    tagColor: "bg-purple-100 text-purple-700",
    description: "Untuk pakaian premium, jas, kebaya, dan item spesial lainnya.",
    features: ["Perlakuan Individual", "Dry Cleaning Tersedia", "Dikemas Rapi"],
    priceKey: "satuan" as const,
    cardBg: "bg-white border-purple-200 shadow-md",
    iconBg: "bg-purple-100 text-purple-600",
  },
];

export function HeroSlide2({ ctaHref, kiloanPrice, satuanPrice }: Props) {
  const priceMap = { kiloan: kiloanPrice, satuan: satuanPrice };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-primary/5 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Pilih Layanan Anda
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Dua Cara Cuci, <span className="text-primary">Satu Solusi</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
            Pilih layanan yang sesuai dengan kebutuhan laundry Anda hari ini.
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
                <p className="text-xs text-gray-400 mb-0.5">Mulai dari</p>
                <p className="text-xl font-extrabold text-primary">{priceMap[priceKey]}</p>
              </div>

              <Link
                href={ctaHref}
                className="w-full text-center bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all"
              >
                Pesan Sekarang
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
