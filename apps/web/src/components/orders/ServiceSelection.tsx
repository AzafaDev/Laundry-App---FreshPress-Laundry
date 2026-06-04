import { Settings, Shirt, TowelRack } from "lucide-react";
import { formatRupiah } from "@/utils/formatPrice";
import {
  DRY_CLEANING_START_PRICE,
  WASH_AND_FOLD_RATE_PER_KG,
} from "@/utils/orderPricing";

interface Props {
  selected: string;
  onSelect: (value: string) => void;
  onNext: () => void;
}

export const ServiceSelection = ({ selected, onSelect, onNext }: Props) => (
  <div className="bg-surface rounded-xl border border-outline-variant p-4 md:p-6 shadow-sm">
    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
      <Settings className="text-secondary w-5 h-5" />
      Select Service
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1 */}
      <button
        onClick={() => onSelect("wash-and-fold")}
        className={`relative text-left rounded-xl p-4 border-2 transition-all ${
          selected === "wash-and-fold"
            ? "border-primary bg-surface-container-low shadow-md"
            : "border-outline-variant bg-surface hover:border-primary-fixed-dim"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <Shirt className="text-primary w-8 h-8" />
          <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === "wash-and-fold"
                ? "border-primary"
                : "border-outline-variant"
            }`}
          >
            {selected === "wash-and-fold" && (
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </span>
        </div>
        <h3 className="font-bold text-primary">Wash & Fold</h3>
        <p className="text-sm text-on-surface-variant">
          Standard everyday laundry, cleaned, dried, and neatly folded.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-full text-xs">
            Fresh
          </span>
          <span className="text-sm font-bold">
            {formatRupiah(WASH_AND_FOLD_RATE_PER_KG)} / kg
          </span>
        </div>
      </button>

      {/* Card 2 */}
      <button
        onClick={() => onSelect("dry-cleaning")}
        className={`relative text-left rounded-xl p-4 border-2 transition-all ${
          selected === "dry-cleaning"
            ? "border-primary bg-surface-container-low shadow-md"
            : "border-outline-variant bg-surface hover:border-primary-fixed-dim"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <TowelRack className="text-outline w-8 h-8" />
          <span
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selected === "dry-cleaning"
                ? "border-primary"
                : "border-outline-variant"
            }`}
          >
            {selected === "dry-cleaning" && (
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </span>
        </div>
        <h3 className="font-bold text-on-surface">Dry Cleaning</h3>
        <p className="text-sm text-on-surface-variant">
          Delicate care for formal wear, suits, and specialty fabrics.
        </p>
        <div className="mt-3 text-sm font-bold">
          Mulai {formatRupiah(DRY_CLEANING_START_PRICE)} / item
        </div>
      </button>
    </div>
    <button
      onClick={onNext}
      className="mt-6 w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90 transition-all"
    >
      Continue
    </button>
  </div>
);
