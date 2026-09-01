"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Truck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { addressService, type CustomerAddress, type DeliveryEstimate } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { useAuthStore } from "@/stores/authStore";
import { AddressPicker } from "@/components/customer/pickup/AddressPicker";
import { SchedulePicker, getTodayDateKey } from "@/components/customer/pickup/SchedulePicker";
import { DeliveryFeeCard } from "@/components/customer/pickup/DeliveryFeeCard";
import { useTranslation } from "@/i18n/useTranslation";

export default function CustomerOrderPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, _hasHydrated } = useAuthStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);
  const [createOrderSuccess, setCreateOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) router.replace("/customer/login?redirect=/customer/pickup");
  }, [_hasHydrated, user, router]);

  const { data: addresses = [], isLoading: loadingAddresses, isError: hasAddressError, refetch: refetchAddresses } = useQuery<CustomerAddress[]>({
    queryKey: ["customer", "addresses"],
    queryFn: addressService.list,
    enabled: _hasHydrated && !!user,
  });

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
      setCreateOrderSuccess(t("pickup.orderSuccess", { invoice: createdOrder.invoice_number }));
      setCreateOrderError(null);
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t("pickup.orderError");
      setCreateOrderError(message);
      setCreateOrderSuccess(null);
    },
  });

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  const { data: deliveryEstimate, isLoading: loadingEstimate, isError: hasEstimateError } = useQuery<DeliveryEstimate>({
    queryKey: ["customer", "delivery-estimate", selectedAddressId],
    queryFn: () => addressService.estimateDeliveryFee(selectedAddressId!),
    enabled: _hasHydrated && !!user && !!selectedAddressId,
  });

  console.log(deliveryEstimate)

  const canOrder = !!selectedAddress && !loadingAddresses && !createOrderMutation.isPending && !createOrderSuccess;

  const handleRequestPickup = async () => {
    if (!selectedAddress) { setCreateOrderError(t("pickup.selectAddressFirst")); return; }
    setCreateOrderError(null);
    setCreateOrderSuccess(null);
    await createOrderMutation.mutateAsync({
      pickup_address_id: selectedAddress.id,
      pickup_date: selectedDate,
    });
  };

  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">{t("pickup.preparingPage")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />{t("pickup.backHome")}
          </Link>
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {t("pickup.badge")}
            </span>
            <h1 className="mt-3 text-2xl md:text-3xl font-bold text-on-surface">{t("pickup.title")}</h1>
            <p className="mt-1 text-sm text-on-surface-variant">{t("pickup.subtitle")}</p>
          </div>
        </div>

        <AddressPicker
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          loadingAddresses={loadingAddresses}
          hasAddressError={hasAddressError}
          onSelect={setSelectedAddressId}
          onRetry={() => void refetchAddresses()}
        />

        <SchedulePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {selectedAddress && (
          <DeliveryFeeCard
            loadingEstimate={loadingEstimate}
            hasEstimateError={hasEstimateError}
            deliveryEstimate={deliveryEstimate}
          />
        )}

        {createOrderError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" /><span>{createOrderError}</span>
          </div>
        )}
        {createOrderSuccess && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700 flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0" />
            <div className="space-y-3">
              <p>{createOrderSuccess}</p>
              <Link href="/customer/orders" className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors">
                {t("pickup.viewOrderProgress")}
              </Link>
            </div>
          </div>
        )}

        <button type="button" onClick={() => void handleRequestPickup()} disabled={!canOrder} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-on-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {createOrderMutation.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" />{t("pickup.processingPickup")}</>
          ) : (
            <><Truck className="w-5 h-5" />{t("pickup.orderPickupNow")}</>
          )}
        </button>

        <div className="rounded-2xl border border-outline-variant bg-surface px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-semibold text-on-surface text-sm">{t("pickup.haveOrderTitle")}</p>
            <p className="text-sm text-on-surface-variant mt-0.5">{t("pickup.haveOrderDesc")}</p>
          </div>
          <Link href="/customer/orders" className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-container transition-colors shadow-sm">
            {t("pickup.viewProgress")}
          </Link>
        </div>
      </main>
    </div>
  );
}
