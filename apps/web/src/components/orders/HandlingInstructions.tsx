import { NotebookPen, Droplets, Thermometer } from "lucide-react";

export const HandlingInstructions = () => (
  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <NotebookPen className="text-tertiary w-5 h-5" />
      Handling Instructions
    </h3>

    <div className="space-y-4">
      <div className="p-4 bg-tertiary-fixed rounded-lg">
        <p className="text-xs text-on-tertiary-fixed font-bold uppercase tracking-wider mb-1">
          Customer Request
        </p>
        <p className="text-sm text-on-tertiary-fixed">
          "Please use scent-free detergent for the bedsheets. One of the denim
          trousers has a light grass stain on the left knee."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-outline-variant rounded-lg flex items-start gap-2">
          <Droplets className="text-primary w-5 h-5 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Detergent Type</p>
            <p className="text-sm text-on-surface-variant">
              Eco-Friendly Hypoallergenic
            </p>
          </div>
        </div>
        <div className="p-4 border border-outline-variant rounded-lg flex items-start gap-2">
          <Thermometer className="text-primary w-5 h-5 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Wash Temperature</p>
            <p className="text-sm text-on-surface-variant">Cold (30°C)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
