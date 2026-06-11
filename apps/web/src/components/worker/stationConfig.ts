import { Shirt, Blend, Package } from "lucide-react";
import type { Discrepancy } from "@/services/workerStation.service";

export const stationConfig = {
  washing: {
    title: "Stasiun Cuci",
    subtitle: "Proses cucian yang masuk",
    Icon: Shirt,
    accentClass: "bg-blue-50 border-blue-100",
    iconClass: "text-blue-500 bg-blue-100",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  ironing: {
    title: "Stasiun Setrika",
    subtitle: "Proses setrika yang masuk",
    Icon: Blend,
    accentClass: "bg-orange-50 border-orange-100",
    iconClass: "text-orange-500 bg-orange-100",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  packing: {
    title: "Stasiun Packing",
    subtitle: "Proses packing yang masuk",
    Icon: Package,
    accentClass: "bg-emerald-50 border-emerald-100",
    iconClass: "text-emerald-600 bg-emerald-100",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
};

export const statusLabel: Record<string, string> = {
  washing_in_progress: "Sedang dicuci",
  ironing_in_progress: "Sedang disetrika",
  packing_in_progress: "Sedang dipacking",
  ready_for_washing: "Antri cuci",
  ready_for_ironing: "Antri setrika",
  ready_for_packing: "Antri packing",
  washing: "Antri cuci",
  ironing: "Antri setrika",
  packing: "Antri packing",
};

export interface BypassState {
  discrepancies: Discrepancy[];
  actualItems: Array<{ clothing_type_id: string; actual_quantity: number }>;
  submitted: boolean;
}
