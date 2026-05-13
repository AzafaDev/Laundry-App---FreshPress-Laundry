import { Store, MapPin, Star } from "lucide-react";

interface Props {
  name: string;
  distance: string;
  rating: number;
  price: string;
}

export const OutletCard = ({ name, distance, rating, price }: Props) => (
  <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div className="flex gap-3">
        <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center text-primary">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{name}</h3>
          <div className="flex items-center gap-1 text-on-surface-variant text-xs">
            <MapPin className="w-3.5 h-3.5" />
            {distance}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full">
        <Star className="w-3.5 h-3.5 text-tertiary" fill="currentColor" />
        <span className="text-xs font-bold text-tertiary">{rating}</span>
      </div>
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
      <div>
        <span className="text-xs text-on-surface-variant">Mulai dari</span>
        <p className="text-sm font-bold text-primary">{price}</p>
      </div>
      <button className="bg-primary text-on-primary px-6 py-1.5 rounded-lg text-xs font-medium hover:opacity-90">
        Pilih
      </button>
    </div>
  </div>
);
