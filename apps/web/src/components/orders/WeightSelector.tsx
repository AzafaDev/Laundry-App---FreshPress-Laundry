import { Scale, Minus, Plus } from "lucide-react";

interface Props {
  weight: number;
  onChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const WeightSelector = ({ weight, onChange, onNext, onBack }: Props) => (
  <div className="bg-surface rounded-xl border border-outline-variant p-4 md:p-6 shadow-sm space-y-4">
    <h2 className="text-lg font-bold flex items-center gap-2">
      <Scale className="text-secondary w-5 h-5" />
      Estimated Weight
    </h2>
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="w-full md:w-1/2 space-y-2">
        <label className="text-sm font-bold text-on-surface-variant">
          Berat dalam Kilogram (kg)
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChange(Math.max(1, weight - 1))}
            className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest border border-outline-variant"
          >
            <Minus className="w-5 h-5" />
          </button>
          <input
            type="number"
            value={weight}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full text-center text-xl font-bold bg-surface border-outline-variant rounded-lg focus:ring-primary"
          />
          <button
            onClick={() => onChange(weight + 1)}
            className="w-12 h-12 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:opacity-90 shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="w-full md:w-1/2 bg-surface-container-low p-4 rounded-xl border border-primary-fixed-dim/30">
        <p className="text-sm text-on-surface-variant">
          <span className="font-bold text-primary">Pro Tip:</span> Satu kantong
          laundry besar biasanya sekitar 5-7 kg. Berat final akan kami ukur saat
          pickup.
        </p>
      </div>
    </div>
    <div className="flex gap-3">
      <button
        onClick={onBack}
        className="flex-1 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg font-bold hover:bg-surface-container-low"
      >
        Back
      </button>
      <button
        onClick={onNext}
        className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:opacity-90"
      >
        Continue
      </button>
    </div>
  </div>
);
