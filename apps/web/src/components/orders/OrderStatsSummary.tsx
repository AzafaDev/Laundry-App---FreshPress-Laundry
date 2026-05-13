export const OrderStatsSummary = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <StatItem label="Active Orders" value="124" color="text-primary" />
    <StatItem label="Processing" value="42" color="text-secondary" />
    <StatItem
      label="Ready for Pickup"
      value="18"
      color="text-primary-container"
    />
    <StatItem label="Completed Today" value="64" color="text-outline" />
  </div>
);

const StatItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div className="bg-surface border border-outline-variant p-4 rounded-xl shadow-sm">
    <p className="text-xs text-on-surface-variant">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);
