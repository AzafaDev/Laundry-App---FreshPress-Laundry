"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { addressService, type CustomerAddress } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";

const getTodayDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "01:00 PM - 03:00 PM",
  "05:00 PM - 07:00 PM",
];

const PICKUP_DATES = Array.from({ length: 4 }, (_, offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const key = `${year}-${month}-${day}`;
  const label = offset === 0
    ? "Hari ini"
    : date.toLocaleDateString("id-ID", { weekday: "short" });
  const dayNum = date.toLocaleDateString("id-ID", { day: "2-digit" });
  const monthStr = date.toLocaleDateString("id-ID", { month: "short" });
  return { key, label, day: dayNum, month: monthStr };
});

export default function CustomerOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, _hasHydrated } = useAuthStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[1]);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);
  const [createOrderSuccess, setCreateOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/customer/login?redirect=/customer/order");
    }
  }, [_hasHydrated, user, router]);

  const {
    data: addresses = [],
    isLoading: loadingAddresses,
    isError: hasAddressError,
    refetch: refetchAddresses,
  } = useQuery<CustomerAddress[]>({
    queryKey: ["customer", "addresses"],
    queryFn: addressService.list,
    enabled: _hasHydrated && !!user,
  });

  // Auto-select primary address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const primary = addresses.find((a) => a.is_primary) ?? addresses[0];
      setSelectedAddressId(primary.id);
    }
  }, [addresses, selectedAddressId]);

  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: async (createdOrder) => {
      await queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      setCreateOrderSuccess(`Order ${createdOrder.invoice_number} berhasil dibuat! Kurir akan segera menjemput laundry Anda.`);
      setCreateOrderError(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal membuat order. Silakan coba lagi.";
      setCreateOrderError(message);
      setCreateOrderSuccess(null);
    },
  });

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  const canOrder =
    !!selectedAddress &&
    !loadingAddresses &&
    !createOrderMutation.isPending &&
    !createOrderSuccess;

  const handleRequestPickup = async () => {
    if (!selectedAddress) {
      setCreateOrderError("Pilih alamat pickup terlebih dahulu.");
      return;
    }

    setCreateOrderError(null);
    setCreateOrderSuccess(null);

    await createOrderMutation.mutateAsync({
      pickup_address_id: selectedAddress.id,
      pickup_date: selectedDate,
      pickup_time_slot: selectedTime,
      service_type: "wash-and-fold",
      notes: "Order pickup dibuat dari halaman customer.",
    });
  };

  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Menyiapkan halaman order...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke beranda
          </Link>

          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Pickup Laundry
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-bold text-on-surface">
              Pesan pickup laundry
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Pilih alamat penjemputan, lalu konfirmasi. Kurir kami akan segera datang.
            </p>
          </div>
        </div>

        {/* Address selection */}
        <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Pilih Alamat Pickup</h2>
              <p className="text-sm text-on-surface-variant">Kurir akan menjemput dari alamat ini.</p>
            </div>
          </div>

          {loadingAddresses && (
            <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-4 py-5 text-sm text-on-surface-variant">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Memuat alamat...
            </div>
          )}

          {!loadingAddresses && hasAddressError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
                <div className="space-y-3">
                  <p>Gagal memuat alamat pickup.</p>
                  <button
                    onClick={() => void refetchAddresses()}
                    className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loadingAddresses && !hasAddressError && addresses.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-4 py-5 text-sm text-on-surface-variant">
              <p>Anda belum punya alamat pickup. Tambahkan alamat dulu agar order bisa diproses.</p>
              <Link
                href="/customer/locations/add-address"
                className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary/90 transition-colors"
              >
                Tambah alamat pickup
              </Link>
            </div>
          )}

          {!loadingAddresses && !hasAddressError && addresses.length > 0 && (
            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected = address.id === selectedAddressId;
                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-outline-variant bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-on-surface">{address.label}</span>
                          {address.is_primary && (
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-on-surface-variant truncate">{address.address}</p>
                        <p className="text-xs text-on-surface-variant">
                          {address.district}, {address.city}, {address.province}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}

              <Link
                href="/customer/locations"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <MapPin className="w-4 h-4" />
                Kelola alamat
              </Link>
            </div>
          )}
        </section>

        {/* Schedule picker */}
        <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Jadwal Pickup</h2>
              <p className="text-sm text-on-surface-variant">Pilih tanggal dan jam penjemputan.</p>
            </div>
          </div>

          {/* Date selection */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tanggal</p>
            <div className="grid grid-cols-4 gap-2">
              {PICKUP_DATES.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDate(d.key)}
                  className={`py-3 px-2 rounded-2xl border-2 text-center transition-all ${
                    selectedDate === d.key
                      ? "border-primary bg-primary/5"
                      : "border-outline-variant bg-surface hover:border-primary/40"
                  }`}
                >
                  <span className="block text-xs font-bold uppercase text-on-surface-variant">{d.label}</span>
                  <span className="block text-xl font-bold text-on-surface">{d.day}</span>
                  <span className="block text-xs text-on-surface-variant">{d.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time slot selection */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Jam Pickup</p>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    selectedTime === slot
                      ? "border-primary bg-primary text-on-primary shadow-sm"
                      : "border-outline-variant bg-surface text-on-surface hover:border-primary/50"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback */}
        {createOrderError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
            <span>{createOrderError}</span>
          </div>
        )}

        {createOrderSuccess && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700 flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0" />
            <div className="space-y-3">
              <p>{createOrderSuccess}</p>
              <Link
                href="/customer/orders"
                className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
              >
                Lihat progress pesanan
              </Link>
            </div>
          </div>
        )}

        {/* Confirm button */}
        <button
          type="button"
          onClick={() => void handleRequestPickup()}
          disabled={!canOrder}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-on-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses pickup...
            </>
          ) : (
            <>
              <Truck className="w-5 h-5" />
              Pesan Pickup Sekarang
            </>
          )}
        </button>

        {/* Link to progress page */}
        <div className="rounded-2xl border border-outline-variant bg-surface px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold text-on-surface text-sm">Sudah punya pesanan?</p>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Pantau status dan progress laundry kamu secara real-time.
            </p>
          </div>
          <Link
            href="/customer/orders"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-container transition-colors shadow-sm"
          >
            Lihat Progress Pesanan
          </Link>
        </div>
      </main>
    </div>
  );
}
