import { Truck, CheckCircle, AlertTriangle, ShoppingBasket } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  local_shipping: <Truck className="w-5 h-5" />,
  check_circle: <CheckCircle className="w-5 h-5" />,
  error: <AlertTriangle className="w-5 h-5" />,
  shopping_basket: <ShoppingBasket className="w-5 h-5" />,
};

const transactions = [
  {
    icon: "local_shipping",
    title: "Pickup Scheduled",
    desc: "Downtown #12 - 5 min ago",
    amount: "+$45.00",
    type: "positive",
  },
  {
    icon: "check_circle",
    title: "Order Completed",
    desc: "Westside Outlet - 12 min ago",
    amount: "+$32.50",
    type: "positive",
  },
  {
    icon: "error",
    title: "Delayed Shipment",
    desc: "North Hub - 1 hr ago",
    amount: "Alert",
    type: "error",
  },
  {
    icon: "shopping_basket",
    title: "Supply Order",
    desc: "Main Warehouse - 2 hr ago",
    amount: "-$240.00",
    type: "neutral",
  },
];

export const RecentTransactions = () => (
  <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
    <h3 className="text-lg font-bold mb-6">Recent Transactions</h3>
    <div className="space-y-4">
      {transactions.map((tx, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 ${
            i < transactions.length - 1
              ? "border-b border-outline-variant pb-4"
              : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
            {iconMap[tx.icon]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{tx.title}</p>
            <p className="text-xs text-on-surface-variant">{tx.desc}</p>
          </div>
          <span
            className={`text-sm font-bold ${
              tx.type === "positive"
                ? "text-primary"
                : tx.type === "error"
                  ? "text-error"
                  : "text-on-surface-variant"
            }`}
          >
            {tx.amount}
          </span>
        </div>
      ))}
    </div>
    <button className="w-full mt-6 py-2 text-sm font-bold text-primary hover:bg-surface-container-high rounded-lg transition-colors">
      View All Activities
    </button>
  </div>
);
