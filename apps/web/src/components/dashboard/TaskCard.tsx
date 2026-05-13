import { MapPin, CheckCircle, Map } from "lucide-react";

interface TaskCardProps {
  customer: string;
  address: string;
  service: string;
  statusBadge?: string;
  statusMessage?: string;
  type: "pickup" | "delivery";
}

export const TaskCard = ({
  customer,
  address,
  service,
  statusBadge,
  statusMessage,
  type,
}: TaskCardProps) => (
  <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-on-surface">{customer}</h4>
          <div className="flex items-center gap-1 text-on-surface-variant mt-1">
            <MapPin className="w-[18px] h-[18px]" />
            <p className="text-sm">{address}</p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-lg text-xs font-bold ${
            type === "pickup"
              ? "bg-surface-container-high text-on-surface-variant"
              : "bg-tertiary-fixed text-on-tertiary-fixed"
          }`}
        >
          {service}
        </span>
      </div>

      {/* Status (delivery only) */}
      {type === "delivery" && statusMessage && (
        <div className="bg-surface-container-lowest p-2 rounded-lg mb-4 border border-outline-variant/30">
          <div className="flex items-center gap-1 text-on-surface-variant text-xs">
            <CheckCircle className="w-[16px] h-[16px] text-primary" />
            {statusMessage}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-container text-primary rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors border border-outline-variant">
          <Map className="w-[20px] h-[20px]" />
          Navigate
        </button>
        <button className="flex-[1.5] py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all">
          Complete Task
        </button>
      </div>
    </div>
  </div>
);
