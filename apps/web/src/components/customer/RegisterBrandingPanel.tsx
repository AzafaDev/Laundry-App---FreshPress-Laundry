"use client";

import { CheckCircle, Gift, Headphones, Shield, Shirt } from "lucide-react";

export function RegisterBrandingPanel() {
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
          Gabung sekarang, <span className="text-primary">nikmati kemudahannya.</span>
        </h1>
        <p className="text-on-surface-variant">
          Ribuan pelanggan sudah mempercayakan laundry mereka kepada FreshPress. Saatnya giliran Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Gift, title: "Gratis Pickup", desc: "Antar-jemput tanpa biaya tambahan", color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
          { icon: CheckCircle, title: "Garansi Bersih", desc: "Tidak puas? Uang kembali penuh", color: "bg-blue-50 border-blue-100 text-blue-600" },
          { icon: Shield, title: "Aman & Terpercaya", desc: "Data dan pakaian Anda terlindungi", color: "bg-violet-50 border-violet-100 text-violet-600" },
          { icon: Headphones, title: "Support 24/7", desc: "Tim siap membantu kapan saja", color: "bg-amber-50 border-amber-100 text-amber-600" },
        ].map(({ icon: Icon, title, desc, color }) => (
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
          &ldquo;Pakaian selalu bersih dan harum, pickup tepat waktu. Sudah 6 bulan pakai FreshPress dan tidak mau pindah ke laundry lain!&rdquo;
        </p>
        <p className="text-xs font-bold text-on-surface mt-3">— Sari W., Jakarta Selatan</p>
      </div>
    </div>
  );
}
