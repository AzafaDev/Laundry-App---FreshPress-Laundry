import { ArrowRight, BadgeCheck } from "lucide-react";
import { formatRupiah } from "@/utils/formatPrice";
import { SERVICE_FEE, WASH_AND_FOLD_RATE_PER_KG } from "@/utils/orderPricing";

interface Props {
  service: string;
  weight: number;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  isConfirming?: boolean;
  confirmLabel?: string;
}

export const OrderSummaryCard = ({
  service,
  weight,
  onConfirm,
  confirmDisabled = false,
  isConfirming = false,
  confirmLabel = "Confirm Order",
}: Props) => {
  const serviceLabel =
    service === "wash-and-fold" ? "Wash & Fold" : "Dry Cleaning";
  const basePrice =
    service === "wash-and-fold" ? WASH_AND_FOLD_RATE_PER_KG * weight : 0;
  const total = basePrice + SERVICE_FEE;

  return (
    <div className="bg-surface rounded-xl border border-outline-variant p-4 md:p-6 shadow-lg">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>
      <div className="space-y-3 border-b border-outline-variant pb-3 mb-3">
        {service === "wash-and-fold" && (
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">
              {serviceLabel} ({weight} kg)
            </span>
            <span className="font-bold">{formatRupiah(basePrice)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Pickup & Delivery</span>
          <span className="text-primary font-bold">FREE</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">Service Fee</span>
          <span className="font-bold">{formatRupiah(SERVICE_FEE)}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold">Estimated Total</span>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary block leading-none">
            {formatRupiah(total)}
          </span>
          <span className="text-xs text-on-surface-variant">
            Subject to final weight
          </span>
        </div>
      </div>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled || isConfirming}
        className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isConfirming ? "Memproses..." : confirmLabel}
        <ArrowRight className="w-5 h-5" />
      </button>
      <p className="mt-3 text-center text-xs text-on-surface-variant flex items-center justify-center gap-1">
        <BadgeCheck className="w-4 h-4" />
        Secure payment processing
      </p>
    </div>
  );
};
