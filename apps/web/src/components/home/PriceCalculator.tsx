"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Shirt,
  Package,
  Sparkles,
  Zap,
  Plus,
  Minus,
  Calculator,
  Truck,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

type ServiceId = "wash_fold" | "wash_setrika" | "dry_cleaning" | "express";
type Unit = "kg" | "pcs";

interface Service {
  id: ServiceId;
  label: string;
  desc: string;
  pricePerUnit: number;
  unit: Unit;
  icon: React.ElementType;
  tag: string;
  tagColor: string;
  max: number;
  step: number;
}

const SERVICES: Service[] = [
  {
    id: "wash_fold",
    label: "Wash & Fold",
    desc: "Cuci bersih dan lipat rapi.",
    pricePerUnit: 7_000,
    unit: "kg",
    icon: Shirt,
    tag: "Terpopuler",
    tagColor: "bg-primary text-white",
    max: 50,
    step: 0.5,
  },
  {
    id: "wash_setrika",
    label: "Wash & Setrika",
    desc: "Cuci plus penyetrikaan uap profesional.",
    pricePerUnit: 15_000,
    unit: "kg",
    icon: Package,
    tag: "Esensial",
    tagColor: "bg-surface-container-high text-on-surface-variant",
    max: 50,
    step: 0.5,
  },
  {
    id: "dry_cleaning",
    label: "Dry Cleaning",
    desc: "Perawatan khusus untuk kain halus.",
    pricePerUnit: 25_000,
    unit: "pcs",
    icon: Sparkles,
    tag: "Premium",
    tagColor: "bg-tertiary-container text-on-tertiary-container",
    max: 30,
    step: 1,
  },
  {
    id: "express",
    label: "Express 6 Jam",
    desc: "Selesai dalam 6 jam untuk kebutuhan mendesak.",
    pricePerUnit: 20_000,
    unit: "kg",
    icon: Zap,
    tag: "Kilat",
    tagColor: "bg-secondary/10 text-secondary",
    max: 50,
    step: 0.5,
  },
];

function formatRp(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export const PriceCalculator = ({ id }: { id?: string }) => {
  const [qtys, setQtys] = useState<Record<ServiceId, number>>({
    wash_fold: 0,
    wash_setrika: 0,
    dry_cleaning: 0,
    express: 0,
  });

  function setQty(id: ServiceId, value: number) {
    const svc = SERVICES.find((s) => s.id === id)!;
    setQtys((prev) => ({ ...prev, [id]: Math.max(0, Math.min(value, svc.max)) }));
  }

  function step(id: ServiceId, dir: 1 | -1) {
    const svc = SERVICES.find((s) => s.id === id)!;
    setQty(id, qtys[id] + dir * svc.step);
  }

  const { breakdown, total } = useMemo(() => {
    const breakdown = SERVICES.filter((s) => qtys[s.id] > 0).map((s) => ({
      label: s.label,
      qty: qtys[s.id],
      unit: s.unit,
      pricePerUnit: s.pricePerUnit,
      subtotal: qtys[s.id] * s.pricePerUnit,
    }));
    return { breakdown, total: breakdown.reduce((sum, b) => sum + b.subtotal, 0) };
  }, [qtys]);

  const hasItems = breakdown.length > 0;

  return (
    <section id={id} className="bg-white py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="text-primary font-bold uppercase tracking-widest text-xs">
            Kalkulator Harga
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
            Hitung estimasi biaya laundry kamu.
          </h2>
          <p className="text-gray-500 mt-3">
            Pilih layanan dan masukkan jumlah pakaian — estimasi langsung tampil di sini.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* ── Service Cards ── */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {SERVICES.map((svc) => {
              const qty = qtys[svc.id];
              const selected = qty > 0;
              const Icon = svc.icon;

              return (
                <div
                  key={svc.id}
                  className={`rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all ${
                    selected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          selected
                            ? "bg-primary text-white"
                            : "bg-surface-container text-primary"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">
                          {svc.label}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                          {svc.desc}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${svc.tagColor}`}
                    >
                      {svc.tag}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-primary">
                      {formatRp(svc.pricePerUnit)}
                    </span>
                    <span className="text-xs text-gray-400">/{svc.unit}</span>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => step(svc.id, -1)}
                        disabled={qty <= 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-700" />
                      </button>

                      <input
                        type="number"
                        value={qty === 0 ? "" : qty}
                        min={0}
                        max={svc.max}
                        step={svc.step}
                        placeholder="0"
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setQty(svc.id, isNaN(v) || v < 0 ? 0 : v);
                        }}
                        className="w-20 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                      />

                      <button
                        onClick={() => step(svc.id, 1)}
                        disabled={qty >= svc.max}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-700" />
                      </button>

                      <span className="text-xs text-gray-400">{svc.unit}</span>
                    </div>

                    {selected && (
                      <span className="text-sm font-bold text-primary">
                        {formatRp(qty * svc.pricePerUnit)}
                      </span>
                    )}
                  </div>

                  {selected && (
                    <input
                      type="range"
                      min={0}
                      max={svc.max}
                      step={svc.step}
                      value={qty}
                      onChange={(e) => setQty(svc.id, parseFloat(e.target.value))}
                      className="w-full accent-primary h-1.5 rounded-full"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Summary Panel ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-primary px-5 py-4">
                <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                  <Calculator className="w-4 h-4" />
                  Ringkasan Estimasi
                </h2>
              </div>

              <div className="px-5 py-5">
                {!hasItems ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-3">
                      <Package className="w-6 h-6 text-outline" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Pilih layanan di sebelah kiri untuk mulai menghitung.
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3 mb-4">
                      {breakdown.map((b) => (
                        <li
                          key={b.label}
                          className="flex justify-between items-start gap-2 text-sm"
                        >
                          <div>
                            <span className="font-medium text-gray-900">{b.label}</span>
                            <span className="block text-xs text-gray-500">
                              {b.qty} {b.unit} × {formatRp(b.pricePerUnit)}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 shrink-0">
                            {formatRp(b.subtotal)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-lg px-3 py-2 mb-3">
                        <Truck className="w-3.5 h-3.5 shrink-0" />
                        Jemput &amp; antar gratis
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total Estimasi</span>
                        <span className="text-2xl font-extrabold text-primary">
                          {formatRp(total)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        *Harga dapat berbeda tergantung kondisi aktual pakaian.
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Link
                    href="/customer/register"
                    className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary-container transition-colors shadow-sm"
                  >
                    Pesan Sekarang
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  {hasItems && (
                    <button
                      onClick={() =>
                        setQtys({ wash_fold: 0, wash_setrika: 0, dry_cleaning: 0, express: 0 })
                      }
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-surface-container-low border border-surface-container-high px-4 py-4 text-xs text-gray-500 space-y-1.5">
              <p className="font-semibold text-gray-700 text-sm mb-2">Cara menghitung</p>
              <p>• <span className="font-medium">Kg-based</span> — timbang pakaian kering sebelum dicuci.</p>
              <p>• <span className="font-medium">Per pcs</span> — hitung item untuk Dry Cleaning.</p>
              <p>• Minimal order <span className="font-medium">1 kg</span> per layanan berbasis berat.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
