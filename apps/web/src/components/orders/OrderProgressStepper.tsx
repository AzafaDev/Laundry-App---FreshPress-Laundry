import { Check, ArrowRight } from "lucide-react";

const steps = [
  {
    label: "Received & Tagged",
    time: "May 24, 09:15 AM",
    done: true,
    current: false,
  },
  {
    label: "Washing in Progress",
    time: "Started at 10:45 AM",
    done: false,
    current: true,
  },
  {
    label: "Drying & Ironing",
    time: "Scheduled for 12:30 PM",
    done: false,
    current: false,
  },
  {
    label: "Ready for Pickup",
    time: "Pending completion",
    done: false,
    current: false,
  },
];

export const OrderProgressStepper = () => (
  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
    <h3 className="text-lg font-bold mb-4">Order Progress</h3>
    <div className="relative pl-2">
      <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-outline-variant" />
      <div className="space-y-6 relative">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                step.done
                  ? "bg-primary"
                  : step.current
                    ? "bg-primary outline outline-4 outline-surface-container-lowest"
                    : "bg-outline-variant"
              }`}
            >
              {step.done && (
                <Check
                  className="text-[14px] text-white w-[14px] h-[14px]"
                  strokeWidth={3}
                />
              )}
              {step.current && (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <p
                className={`text-sm font-bold ${step.current ? "text-on-surface" : step.done ? "text-primary" : "text-on-surface-variant"}`}
              >
                {step.label}
              </p>
              <p className="text-xs text-on-surface-variant">{step.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <button className="w-full mt-5 bg-primary text-on-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
      Update Status to Drying
      <ArrowRight className="w-5 h-5" />
    </button>
  </div>
);
