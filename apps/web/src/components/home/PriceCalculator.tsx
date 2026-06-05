"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Shirt,
  Plus,
  Minus,
  Calculator,
  Truck,
  ChevronRight,
  RotateCcw,
  Loader2,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { laundryItemService, type LaundryItem } from "@/services/laundryItem.service";

function formatRp(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function toNumber(value: string | number): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

// ── Sub-component: one unit-group card ──────────────────────────────────────

interface UnitCardProps {
  title: string;
  subtitle: string;
  unit: string;
  icon: React.ElementType;
  items: LaundryItem[];
  qtys: Record<string, number>;
  onSetQty: (id: string, value: number) => void;
}

function UnitCard({ title, subtitle, unit, icon: Icon, items, qtys, onSetQty }: UnitCardProps) {
  const step = unit === "kg" ? 0.5 : 1;
  const max = unit === "kg" ? 50 : 30;

  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? "");
  const [inputQty, setInputQty] = useState<number>(step);

  const selectedItem = items.find((i) => i.id === selectedId) ?? items[0];

  if (!selectedItem) return null;

  // Items that have been added (qty > 0)
  const addedItems = items.filter((i) => (qtys[i.id] ?? 0) > 0);

  function handleAdd() {
    if (inputQty <= 0) return;
    const current = qtys[selectedItem.id] ?? 0;
    onSetQty(selectedItem.id, Math.min(current + inputQty, max));
    setInputQty(step);
  }

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 flex flex-col gap-4 transition-all hover:border-primary/30 hover:shadow-sm">
      {/* Card header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <span className="ml-auto shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
          per {unit}
        </span>
      </div>

      {/* Dropdown + qty + add button */}
      <div className="flex flex-col gap-2">
        {/* Dropdown */}
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-surface-container-low px-4 py-2.5 pr-9 text-sm font-medium text-gray-900 focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {formatRp(toNumber(item.base_price))}/{unit}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Qty row + add button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setInputQty((v) => Math.max(step, +(v - step).toFixed(2)))}
              disabled={inputQty <= step}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Minus className="w-3.5 h-3.5 text-gray-700" />
            </button>

            <input
              type="number"
              value={inputQty}
              min={step}
              max={max}
              step={step}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setInputQty(isNaN(v) || v < step ? step : Math.min(v, max));
              }}
              className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />

            <button
              onClick={() => setInputQty((v) => Math.min(+(v + step).toFixed(2), max))}
              disabled={inputQty >= max}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-gray-700" />
            </button>

            <span className="text-xs text-gray-400">{unit}</span>
          </div>

          <button
            onClick={handleAdd}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>
      </div>

      {/* Added items list */}
      {addedItems.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 divide-y divide-primary/10">
          {addedItems.map((item) => {
            const qty = qtys[item.id] ?? 0;
            const price = toNumber(item.base_price);
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {qty} {unit} × {formatRp(price)}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary shrink-0">{formatRp(qty * price)}</span>
                <button
                  onClick={() => onSetQty(item.id, 0)}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export const PriceCalculator = ({ id }: { id?: string }) => {
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const { data: items = [], isLoading, isError } = useQuery<LaundryItem[]>({
    queryKey: ["laundry-items"],
    queryFn: laundryItemService.list,
    staleTime: 5 * 60 * 1000,
  });

  const kgItems = useMemo(() => items.filter((i) => i.unit === "kg"), [items]);
  const pcsItems = useMemo(() => items.filter((i) => i.unit === "pcs"), [items]);

  function setQty(itemId: string, value: number) {
    setQtys((prev) => ({ ...prev, [itemId]: value }));
  }

  const { breakdown, total } = useMemo(() => {
    const breakdown = items
      .filter((s) => (qtys[s.id] ?? 0) > 0)
      .map((s) => {
        const qty = qtys[s.id] ?? 0;
        const pricePerUnit = toNumber(s.base_price);
        return { label: s.name, qty, unit: s.unit, pricePerUnit, subtotal: qty * pricePerUnit };
      });
    return { breakdown, total: breakdown.reduce((sum, b) => sum + b.subtotal, 0) };
  }, [qtys, items]);

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
            Pilih layanan dan masukkan jumlah — estimasi langsung tampil di sini.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* ── Left: 2 unit-group cards ── */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {isLoading && (
              <div className="flex items-center gap-3 text-gray-500 py-12 justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm">Memuat daftar layanan...</span>
              </div>
            )}

            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                Gagal memuat daftar layanan. Coba refresh halaman.
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {kgItems.length > 0 && (
                  <UnitCard
                    title="Layanan Berbasis Berat"
                    subtitle="Masukkan estimasi berat pakaian kering."
                    unit="kg"
                    icon={Shirt}
                    items={kgItems}
                    qtys={qtys}
                    onSetQty={setQty}
                  />
                )}
                {pcsItems.length > 0 && (
                  <UnitCard
                    title="Layanan Per Item"
                    subtitle="Hitung jumlah item untuk perawatan khusus."
                    unit="pcs"
                    icon={Package}
                    items={pcsItems}
                    qtys={qtys}
                    onSetQty={setQty}
                  />
                )}
              </>
            )}
          </div>

          {/* ── Right: Summary Panel ── */}
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
                        <li key={b.label} className="flex justify-between items-start gap-2 text-sm">
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
                      onClick={() => setQtys({})}
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
              <p>• <span className="font-medium">Per pcs</span> — hitung item individual.</p>
              <p>• Minimal order <span className="font-medium">1 kg</span> per layanan berbasis berat.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
