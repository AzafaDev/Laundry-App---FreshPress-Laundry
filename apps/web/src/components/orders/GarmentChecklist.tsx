import { CheckSquare, Pencil, Shirt, Bed, AlertTriangle } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  checkroom: <Shirt className="w-5 h-5" />,
  apparel: <Shirt className="w-5 h-5" />,
  bed: <Bed className="w-5 h-5" />,
};

interface GarmentItem {
  icon: string;
  title: string;
  desc: string;
  expected: number;
  received: number;
}

const garments: GarmentItem[] = [
  {
    icon: "checkroom",
    title: "Men's Formal Shirts",
    desc: "Cotton, White/Blue",
    expected: 5,
    received: 5,
  },
  {
    icon: "apparel",
    title: "Denim Trousers",
    desc: "Regular Wash",
    expected: 3,
    received: 2, // mismatch
  },
  {
    icon: "bed",
    title: "Bedsheets (King)",
    desc: "Delicate cycle requested",
    expected: 2,
    received: 2,
  },
];

export const GarmentChecklist = ({ onBypass }: { onBypass: () => void }) => (
  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
    <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <CheckSquare className="text-primary w-5 h-5" />
        Garment Checklist
      </h3>
      <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
        <Pencil className="w-[18px] h-[18px]" />
        Edit List
      </button>
    </div>

    <div className="divide-y divide-outline-variant">
      {garments.map((item, idx) => (
        <div
          key={idx}
          className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center text-on-surface-variant">
              {iconMap[item.icon]}
            </div>
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-xs text-on-surface-variant">{item.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">Expected</p>
              <p className="font-bold">{item.expected}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-on-surface-variant">Received</p>
              <p
                className={`font-bold ${item.received !== item.expected ? "text-error" : "text-primary"}`}
              >
                {item.received}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Mismatch alert */}
    <div className="p-4 bg-error-container/30 border-t border-outline-variant flex items-center justify-between">
      <div className="flex items-center gap-2 text-on-error-container">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm font-bold">Quantity Mismatch Detected</span>
      </div>
      <button
        onClick={onBypass}
        className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
      >
        Request Bypass
      </button>
    </div>
  </div>
);
