import {
  ReceiptText,
  DollarSign,
  Store,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  receipt_long: <ReceiptText className="w-5 h-5" />,
  payments: <DollarSign className="w-5 h-5" />,
  storefront: <Store className="w-5 h-5" />,
  group: <Users className="w-5 h-5" />,
};

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: { direction: "up" | "down"; value: string } | "stable" | "online";
}

export const StatCard = ({ icon, label, value, trend }: StatCardProps) => (
  <div className="bg-surface border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-surface-container-high rounded-lg text-primary">
        {iconMap[icon]}
      </div>
      {trend === "stable" && (
        <span className="text-xs text-on-surface-variant">Stable</span>
      )}
      {trend === "online" && (
        <span className="text-xs text-primary font-bold">Online</span>
      )}
      {typeof trend === "object" && (
        <span className="flex items-center gap-1 text-primary font-bold text-xs">
          {trend.direction === "up" ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {trend.value}
        </span>
      )}
    </div>
    <p className="text-sm text-on-surface-variant">{label}</p>
    <h3 className="text-2xl font-bold">{value}</h3>
  </div>
);
