import { Clock, Clock4, WashingMachine, TowelRack, Shirt, AlertCircle, ChevronRight } from "lucide-react";

interface OrderCardProps {
  customer: string;
  orderId: string;
  weight: string;
  service: string;
  dueTime?: string;
  urgent?: boolean;
  status: "in-progress" | "waiting";
}

export const OrderCard = ({
  customer,
  orderId,
  weight,
  service,
  dueTime,
  urgent,
  status,
}: OrderCardProps) => {
  const isActive = status === "in-progress";

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                isActive
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              {isActive ? (
                <Clock className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Clock4 className="w-3.5 h-3.5 mr-1" />
              )}
              {isActive ? "In Progress" : "Waiting"}
            </span>
            <span className="text-xs text-on-surface-variant">#{orderId}</span>
          </div>
          <h3 className="text-lg font-bold">{customer}</h3>
        </div>

        <div className="bg-surface-container p-2 rounded-lg">
          {isActive ? (
            <WashingMachine className="text-primary w-5 h-5" />
          ) : (
            <TowelRack className="text-primary w-5 h-5" />
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Shirt className="w-4 h-4" />
          <p className="text-sm">
            {weight} • {service}
          </p>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          {urgent ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <p className={`text-sm ${urgent ? "text-tertiary font-medium" : ""}`}>
            {urgent ? "Urgent • Express Service" : `Due: ${dueTime}`}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 group-hover:scale-[0.99] transition-transform ${
          isActive
            ? "bg-secondary text-on-secondary"
            : "bg-white border border-secondary text-secondary"
        }`}
      >
        View Detail
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
