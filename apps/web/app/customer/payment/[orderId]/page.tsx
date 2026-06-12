"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Home,
  Loader2,
  XCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { orderService, type CustomerOrder } from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";
import { formatRupiah } from "@/utils/formatPrice";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { useCreatePaymentTransaction, usePaymentStatus, useSyncPaymentStatus } from "@/hooks/usePayment";

const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function CustomerPaymentPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const { user, _hasHydrated } = useAuthStore();
  const isSnapReady = useMidtransSnap();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/customer/login");
    }
  }, [_hasHydrated, user, router]);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useQuery<CustomerOrder>({
    queryKey: ["customer", "orders", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: _hasHydrated && !!user && !!orderId,
  });

  const {
    data: payment,
    isLoading: isPaymentLoading,
  } = usePaymentStatus(orderId, _hasHydrated && !!user);

  const createTransaction = useCreatePaymentTransaction();
  const syncStatus = useSyncPaymentStatus();

  const isPaid = payment?.status === "paid";
  const isExpiredOrFailed = payment?.status === "expired" || payment?.status === "failed";

  const handlePay = () => {
    setErrorMessage(null);
    createTransaction.mutate(orderId, {
      onSuccess: ({ token }) => {
        if (!window.snap) {
          setErrorMessage("Midtrans Snap belum siap, coba lagi sebentar.");
          return;
        }
        window.snap.pay(token, {
          onSuccess: () => syncStatus.mutate(orderId),
          onPending: () => syncStatus.mutate(orderId),
          onError: () => setErrorMessage("Pembayaran gagal diproses. Silakan coba lagi."),
          onClose: () => syncStatus.mutate(orderId),
        });
      },
      onError: (err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Gagal membuat transaksi pembayaran.";
        setErrorMessage(message);
      },
    });
  };

  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Menyiapkan halaman...</span>
        </div>
      </div>
    );
  }

  // Success layout — shown once payment is confirmed as paid
  if (!isOrderLoading && order && isPaid) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 md:px-8 py-12">
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 md:p-10 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface">
                Pembayaran Berhasil!
              </h1>
              <p className="text-sm text-on-surface-variant">
                Terima kasih, pembayaran untuk pesanan{" "}
                <span className="font-semibold text-on-surface">{order.invoice_number}</span> telah
                kami terima.
              </p>
            </div>

            {/* Receipt summary */}
            <div className="rounded-xl bg-surface-container-low p-4 space-y-2 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Nomor Invoice</span>
                <span className="font-medium text-on-surface">{order.invoice_number}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Outlet</span>
                <span className="font-medium text-on-surface">{order.outlet?.name ?? "-"}</span>
              </div>
              {payment?.paid_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">Waktu Pembayaran</span>
                  <span className="font-medium text-on-surface">
                    {formatDateTime(payment.paid_at)}
                  </span>
                </div>
              )}
              <div className="border-t border-dashed border-outline-variant my-1" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">Total Dibayar</span>
                <span className="text-xl font-extrabold text-primary">
                  {formatRupiah(Number(payment?.amount ?? order.total_price ?? 0))}
                </span>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant">
              Pesanan kamu akan segera disiapkan untuk diantar kembali.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/customer/orders"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md"
              >
                <ClipboardList className="w-4 h-4" />
                Lihat Status Pesanan
              </Link>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 py-3 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <Link
          href="/customer/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke pesanan
        </Link>

        <div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">
            Pembayaran
          </span>
          <h1 className="text-3xl font-bold text-on-surface">Selesaikan pembayaran kamu.</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pembayaran diproses secara aman melalui Midtrans.
          </p>
        </div>

        {(isOrderLoading || isPaymentLoading) && (
          <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 flex items-center justify-center gap-3 text-sm text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Memuat detail pesanan...
          </div>
        )}

        {!isOrderLoading && isOrderError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
            Gagal memuat detail pesanan.
          </div>
        )}

        {!isOrderLoading && order && (
          <>
            {/* Order summary */}
            <div className="rounded-2xl border border-outline-variant bg-surface p-4 md:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">
                  {order.invoice_number}
                </p>
                {isPaid && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Lunas
                  </span>
                )}
                {isExpiredOrFailed && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    <XCircle className="w-3.5 h-3.5" />
                    {payment?.status === "expired" ? "Kedaluwarsa" : "Gagal"}
                  </span>
                )}
                {!isPaid && !isExpiredOrFailed && payment?.status === "pending" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Menunggu Pembayaran
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Outlet</span>
                <span className="font-medium text-on-surface">{order.outlet?.name ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Jadwal Pickup</span>
                <span className="font-medium text-on-surface">
                  {order.pickup_schedule ? formatDateTime(order.pickup_schedule) : "-"}
                </span>
              </div>

              <div className="border-t border-dashed border-outline-variant my-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">Total Tagihan</span>
                <span className="text-xl font-extrabold text-primary">
                  {order.total_price !== null && order.total_price !== undefined
                    ? formatRupiah(Number(order.total_price))
                    : "-"}
                </span>
              </div>

              {payment?.paid_at && (
                <p className="text-xs text-on-surface-variant text-right">
                  Dibayar pada {formatDateTime(payment.paid_at)}
                </p>
              )}
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* CTA */}
            {isPaid ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-5 text-center text-sm text-green-700 font-medium">
                Pembayaran kamu sudah berhasil. Terima kasih!
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePay}
                disabled={createTransaction.isPending || !isSnapReady}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-sm font-bold text-white hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {createTransaction.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {isExpiredOrFailed ? "Coba Bayar Lagi" : "Bayar Sekarang dengan Midtrans"}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
