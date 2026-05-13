import { Gift } from "lucide-react";

export const PromoCard = () => (
  <div className="bg-secondary-container text-on-secondary-container p-4 rounded-xl relative overflow-hidden">
    <div className="relative z-10">
      <h4 className="font-bold mb-1">Subscribe & Save 15%</h4>
      <p className="text-sm">
        Join our Weekly Fresh plan for recurring pickups and exclusive
        discounts.
      </p>
    </div>
    <Gift className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10" />
  </div>
);
