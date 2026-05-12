const steps = [
  { label: "Service", step: 1 },
  { label: "Weight", step: 2 },
  { label: "Schedule", step: 3 },
];

interface Props {
  currentStep: number;
}

export const NewOrderStepper = ({ currentStep }: Props) => (
  <div className="flex items-center justify-between max-w-2xl mx-auto relative">
    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-highest -z-10 -translate-y-1/2" />
    {steps.map(({ label, step }) => (
      <div key={step} className="flex flex-col items-center gap-1">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${
            step <= currentStep
              ? "bg-primary text-on-primary"
              : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {step}
        </div>
        <span
          className={`text-xs font-medium ${
            step <= currentStep ? "text-primary" : "text-on-surface-variant"
          }`}
        >
          {label}
        </span>
      </div>
    ))}
  </div>
);
