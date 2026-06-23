"use client";

import Link from "next/link";
import { BadgeCheck, RefreshCw, Sparkles, Wind } from "lucide-react";

const GUARANTEES = [
  {
    icon: Sparkles,
    label: "Bersih",
    desc: "Noda membandel hilang sempurna dengan deterjen premium kami.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Wind,
    label: "Wangi",
    desc: "Aroma segar tahan lama yang membuat pakaian terasa baru.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: BadgeCheck,
    label: "Rapi",
    desc: "Disetrika dan dikemas dengan presisi oleh tenaga profesional.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
];

interface Props {
  ctaHref: string;
}

export function HeroSlide3({ ctaHref }: Props) {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-white to-green-50 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            Garansi Kepuasan
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Jaminan <span className="text-primary">Bersih, Wangi & Rapi</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Setiap order diproses dengan standar tinggi. Kami percaya diri dengan hasil kerja kami.
          </p>
        </div>

        {/* Guarantee cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mb-5">
          {GUARANTEES.map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">{label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Refund guarantee banner */}
        <div className="max-w-3xl mx-auto bg-primary rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mb-2">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0 mx-auto sm:mx-0">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-extrabold text-base mb-0.5">Tidak Puas? Uang Kembali!</p>
            <p className="text-white/80 text-xs">
              Jika hasil laundry tidak sesuai standar kami, kami siap mencuci ulang atau mengembalikan uang Anda sepenuhnya.
            </p>
          </div>
          <Link
            href={ctaHref}
            className="shrink-0 bg-white text-primary font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-yellow-300 hover:text-gray-900 transition-all active:scale-95 whitespace-nowrap"
          >
            Coba Sekarang
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400">
          * Syarat dan ketentuan berlaku. Klaim refund diproses setelah verifikasi oleh tim kami.
        </p>
      </div>
    </div>
  );
}
