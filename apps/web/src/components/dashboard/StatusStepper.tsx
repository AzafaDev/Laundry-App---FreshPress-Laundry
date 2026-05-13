const steps = [
  { label: "Start", active: true, completed: true },
  { label: "Pickups", active: true, completed: true },
  { label: "Deliver", active: true, completed: false, current: true },
  { label: "Finish", active: false, completed: false },
];

export const StatusStepper = () => (
  <section className="mt-12 p-6 bg-surface border border-outline-variant rounded-2xl">
    <h3 className="text-sm font-bold text-on-surface mb-6 uppercase tracking-wider">
      Shift Progress
    </h3>
    <div className="flex items-center justify-between relative">
      {/* Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -translate-y-1/2" />

      {steps.map((step, i) => (
        <div
          key={step.label}
          className="relative z-10 flex flex-col items-center"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step.current
                ? "bg-secondary-container text-on-secondary-container border-2 border-primary"
                : step.completed
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`text-xs mt-1 ${
              step.completed || step.current
                ? "font-bold text-primary"
                : "text-on-surface-variant"
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  </section>
);
