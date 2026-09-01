"use client";

import { Loader2, Wallet } from "lucide-react";
import type { DeliveryEstimate } from "@/services/address.service";
import { formatRupiah } from "@/utils/formatPrice";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  loadingEstimate: boolean;
  hasEstimateError: boolean;
  deliveryEstimate?: DeliveryEstimate;
}

export function DeliveryFeeCard({ loadingEstimate, hasEstimateError, deliveryEstimate }: Props) {
  const { t } = useTranslation();
  return (
    <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-on-surface">{t("pickup.deliveryFee.title")}</h2>
          <p className="text-sm text-on-surface-variant">{t("pickup.deliveryFee.subtitle")}</p>
        </div>
      </div>

      {loadingEstimate && (
        <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-4 py-4 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />{t("pickup.deliveryFee.calculating")}
        </div>
      )}

      {!loadingEstimate && hasEstimateError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {t("pickup.deliveryFee.calcError")}
        </div>
      )}

      {!loadingEstimate && !hasEstimateError && deliveryEstimate && (
        <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">
              {t("pickup.deliveryFee.nearestOutlet", { name: deliveryEstimate.nearest_outlet.outlet_name })}
            </span>
            <span className="text-xs text-on-surface-variant">
              {deliveryEstimate.nearest_outlet.distance_km.toFixed(1)} km
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-on-surface">{t("pickup.deliveryFee.fee")}</span>
            <span className="text-lg font-extrabold text-primary">
              {deliveryEstimate.nearest_outlet.delivery_fee > 0
                ? formatRupiah(deliveryEstimate.nearest_outlet.delivery_fee)
                : t("pickup.deliveryFee.free")}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
