"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Circle,
  Loader2,
  MapPin,
  Truck,
} from "lucide-react";
import { NewOrderStepper } from "@/components/orders/NewOrderStepper";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";
import { PromoCard } from "@/components/orders/PromoCard";
import { SchedulePicker } from "@/components/orders/SchedulePicker";
import { ServiceSelection } from "@/components/orders/ServiceSelection";
import { WeightSelector } from "@/components/orders/WeightSelector";
import { Navbar } from "@/components/layout/Navbar";
import { addressService, type CustomerAddress } from "@/services/address.service";
import {
  orderService,
  type CustomerOrder,
  type CustomerOrderStatus,
} from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";
import { formatRupiah } from "@/utils/formatPrice";

const ORDER_PROGRESS_STEPS: Array<{ key: CustomerOrderStatus; label: string }> = [
  { key: "waiting_pickup_driver", label: "Menunggu driver pickup" },
  { key: "laundry_to_outlet", label: "Driver menjemput laundry" },
  { key: "laundry_arrived_outlet", label: "Laundry tiba di outlet" },
  { key: "washing", label: "Sedang dicuci" },
  { key: "ironing", label: "Sedang disetrika" },
  { key: "packing", label: "Sedang dipacking" },
  { key: "waiting_payment", label: "Menunggu pembayaran" },
  { key: "ready_for_delivery", label: "Siap diantar" },
  { key: "delivery_to_customer", label: "Sedang dikirim" },
  { key: "received_by_customer", label: "Tiba di customer" },
  { key: "completed", label: "Selesai" },
];

const ORDER_STATUS_LABEL: Record<CustomerOrderStatus, string> = {
  waiting_pickup_driver: "Menunggu Pickup Driver",
  laundry_to_outlet: "Menuju Outlet",
  laundry_arrived_outlet: "Tiba di Outlet",
  washing: "Washing",
  ironing: "Ironing",
  packing: "Packing",
  waiting_payment: "Menunggu Pembayaran",
  ready_for_delivery: "Siap Diantar",
  delivery_to_customer: "Dalam Pengantaran",
  received_by_customer: "Diterima Customer",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const ORDER_STATUS_STYLE: Record<CustomerOrderStatus, string> = {
  waiting_pickup_driver: "bg-amber-100 text-amber-800",
  laundry_to_outlet: "bg-blue-100 text-blue-800",
  laundry_arrived_outlet: "bg-cyan-100 text-cyan-800",
  washing: "bg-sky-100 text-sky-800",
  ironing: "bg-indigo-100 text-indigo-800",
  packing: "bg-violet-100 text-violet-800",
  waiting_payment: "bg-orange-100 text-orange-800",
  ready_for_delivery: "bg-teal-100 text-teal-800",
  delivery_to_customer: "bg-pink-100 text-pink-800",
  received_by_customer: "bg-emerald-100 text-emerald-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const getTodayDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getProgressIndex = (status: CustomerOrderStatus) =>
  ORDER_PROGRESS_STEPS.findIndex((step) => step.key === status);

const serviceHighlights = [
  {
    icon: Truck,
    title: "Pickup ke alamat utama",
    description: "Kurir menjemput laundry dari alamat yang Anda pilih.",
  },
  {
    icon: CalendarClock,
    title: "Jadwal fleksibel",
    description: "Pilih slot pickup yang sesuai rutinitas Anda.",
  },
  {
    icon: CheckCircle2,
    title: "Konfirmasi cepat",
    description: "Ringkasan order selalu terlihat sebelum checkout aktif.",
  },
];

export default function CustomerOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user, _hasHydrated } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState("wash-and-fold");
  const [weight, setWeight] = useState(5);
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [selectedTime, setSelectedTime] = useState("10:00 AM - 12:00 PM");
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);
  const [createOrderSuccess, setCreateOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) {
      router.replace("/customer/login?redirect=/customer/order");
    }
  }, [_hasHydrated, accessToken, router]);

  const {
    data: addresses = [],
    isLoading: loadingAddresses,
    isError: hasAddressError,
    refetch: refetchAddresses,
  } = useQuery<CustomerAddress[]>({
    queryKey: ["customer", "addresses"],
    queryFn: addressService.list,
    enabled: _hasHydrated && !!accessToken,
  });

  const {
    data: orders = [],
    isLoading: loadingOrders,
    isError: hasOrdersError,
    refetch: refetchOrders,
  } = useQuery<CustomerOrder[]>({
    queryKey: ["customer", "orders"],
    queryFn: orderService.listOrders,
    enabled: _hasHydrated && !!accessToken,
    refetchInterval: 20_000,
  });

  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: async (createdOrder) => {
      await queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      setCreateOrderSuccess(`Order ${createdOrder.invoice_number} berhasil dibuat.`);
      setCreateOrderError(null);
      setCurrentStep(1);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal membuat order. Silakan coba lagi.";
      setCreateOrderError(message);
      setCreateOrderSuccess(null);
    },
  });

  const primaryAddress = useMemo(
    () => addresses.find((address) => address.is_primary) ?? addresses[0] ?? null,
    [addresses],
  );

  const canConfirmOrder =
    !!primaryAddress &&
    currentStep === 3 &&
    !loadingAddresses &&
    !createOrderMutation.isPending;

  const handleConfirmOrder = async () => {
    if (!primaryAddress) {
      setCreateOrderError("Alamat pickup belum tersedia.");
      return;
    }

    if (currentStep !== 3) {
      setCreateOrderError("Lengkapi langkah Service, Weight, dan Schedule terlebih dahulu.");
      return;
    }

    setCreateOrderError(null);
    setCreateOrderSuccess(null);

    await createOrderMutation.mutateAsync({
      pickup_address_id: primaryAddress.id,
      pickup_date: selectedDate,
      pickup_time_slot: selectedTime,
      service_type: selectedService === "dry-cleaning" ? "dry-cleaning" : "wash-and-fold",
      estimated_weight_kg: selectedService === "dry-cleaning" ? undefined : weight,
      notes: "Order dibuat dari halaman customer order.",
    });
  };

  const addressError = hasAddressError ? "Gagal memuat alamat pickup." : null;

  if (!_hasHydrated || (!accessToken && !user)) {
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] items-start">
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke beranda
            </Link>

            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Customer Order
              </span>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-on-surface">
                  Atur pickup laundry tanpa perlu ke outlet.
                </h1>
                <p className="max-w-2xl text-sm md:text-base text-on-surface-variant">
                  Pilih layanan, estimasi berat, dan jadwal pickup. Alamat utama Anda akan dipakai sebagai titik penjemputan.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {serviceHighlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-outline-variant bg-surface px-4 py-4 shadow-sm"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-bold text-on-surface">{title}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-on-surface">Alamat Pickup</h2>
                <p className="text-sm text-on-surface-variant">Pastikan titik jemput sudah benar sebelum checkout.</p>
              </div>
            </div>

            {loadingAddresses && (
              <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-4 py-5 text-sm text-on-surface-variant">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Memuat alamat customer...
              </div>
            )}

            {!loadingAddresses && addressError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
                  <div className="space-y-3">
                    <p>{addressError}</p>
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

            {!loadingAddresses && !addressError && primaryAddress && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-on-surface">{primaryAddress.label}</span>
                      {primaryAddress.is_primary && (
                        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                          Alamat utama
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">{primaryAddress.address}</p>
                    <p className="text-sm text-on-surface-variant">
                      {primaryAddress.district}, {primaryAddress.city}, {primaryAddress.province}
                      {primaryAddress.postal_code ? ` ${primaryAddress.postal_code}` : ""}
                    </p>
                  </div>
                  <Link
                    href="/customer/locations"
                    className="shrink-0 rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors"
                  >
                    Ganti alamat
                  </Link>
                </div>
              </div>
            )}

            {!loadingAddresses && !addressError && !primaryAddress && (
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
          </section>
        </section>

        <section className="space-y-6">
          <NewOrderStepper currentStep={currentStep} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            <div className="space-y-6 lg:col-span-8">
              {currentStep === 1 && (
                <ServiceSelection
                  selected={selectedService}
                  onSelect={setSelectedService}
                  onNext={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 2 && (
                <WeightSelector
                  weight={weight}
                  onChange={(value) => setWeight(Math.max(1, Number.isNaN(value) ? 1 : value))}
                  onBack={() => setCurrentStep(1)}
                  onNext={() => setCurrentStep(3)}
                />
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <SchedulePicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateChange={setSelectedDate}
                    onTimeChange={setSelectedTime}
                    onBack={() => setCurrentStep(2)}
                  />

                  {createOrderError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                      {createOrderError}
                    </div>
                  )}

                  {createOrderSuccess && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                      {createOrderSuccess}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
              <OrderSummaryCard
                service={selectedService}
                weight={weight}
                onConfirm={() => void handleConfirmOrder()}
                isConfirming={createOrderMutation.isPending}
                confirmDisabled={!canConfirmOrder}
                confirmLabel="Confirm Order"
              />
              <PromoCard />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-on-surface">Progress Pesanan Anda</h2>
            <button
              onClick={() => void refetchOrders()}
              className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors"
            >
              Refresh
            </button>
          </div>

          {loadingOrders && (
            <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-4 text-sm text-on-surface-variant flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Memuat progress pesanan...
            </div>
          )}

          {!loadingOrders && hasOrdersError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              Gagal memuat progress pesanan.
            </div>
          )}

          {!loadingOrders && !hasOrdersError && orders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-4 py-5 text-sm text-on-surface-variant">
              Belum ada pesanan. Buat order pertama Anda untuk mulai melihat tracking progress.
            </div>
          )}

          {!loadingOrders && !hasOrdersError && orders.length > 0 && (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => {
                const progressIndex = getProgressIndex(order.status);
                const activeIndex = progressIndex >= 0 ? progressIndex : 0;

                return (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-outline-variant bg-surface p-4 md:p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-sm text-on-surface-variant">{order.invoice_number}</p>
                        <h3 className="text-base font-bold text-on-surface mt-1">
                          Pickup: {formatDateTime(order.pickup_schedule)}
                        </h3>
                        <p className="text-sm text-on-surface-variant mt-1">
                          Outlet: {order.outlet?.name ?? "-"}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_STYLE[order.status]}`}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                        <p className="text-sm font-semibold text-on-surface mt-2">
                          {order.total_price !== null && order.total_price !== undefined
                            ? formatRupiah(Number(order.total_price))
                            : "Harga menyusul"}
                        </p>
                      </div>
                    </div>

                    {order.status === "cancelled" ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                        Pesanan ini dibatalkan.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                          {ORDER_PROGRESS_STEPS.map((step, idx) => {
                            const isDone = idx < activeIndex;
                            const isCurrent = idx === activeIndex;

                            return (
                              <div
                                key={`${order.id}-${step.key}`}
                                className={`rounded-xl border px-3 py-2 text-xs ${
                                  isCurrent
                                    ? "border-primary bg-primary/10 text-primary"
                                    : isDone
                                      ? "border-green-200 bg-green-50 text-green-700"
                                      : "border-outline-variant bg-surface-container-low text-on-surface-variant"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isDone || isCurrent ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5" />
                                  )}
                                  <span className="font-medium">{step.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {order.status_histories && order.status_histories.length > 0 && (
                          <div className="rounded-xl bg-surface-container-low px-3 py-3 text-xs text-on-surface-variant space-y-1">
                            <p className="font-semibold text-on-surface">Riwayat terbaru</p>
                            <p>
                              {ORDER_STATUS_LABEL[order.status_histories[0].new_status]} - {formatDateTime(order.status_histories[0].created_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}