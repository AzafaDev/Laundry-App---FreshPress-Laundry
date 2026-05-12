const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const orderHeights = [
  "h-1/2",
  "h-2/3",
  "h-4/5",
  "h-3/4",
  "h-[90%]",
  "h-full",
  "h-1/2",
];
const revenueHeights = [
  "h-1/3",
  "h-1/2",
  "h-3/5",
  "h-2/3",
  "h-3/4",
  "h-4/5",
  "h-1/4",
];

export const WeeklyChart = () => (
  <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-lg font-bold">Weekly Performance</h3>
      <div className="flex gap-2">
        <span className="flex items-center gap-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-primary" /> Orders
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-secondary" /> Revenue
        </span>
      </div>
    </div>

    <div className="h-64 flex items-end justify-between gap-2 pt-4">
      {days.map((day, i) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex justify-center gap-1 items-end h-full">
            <div
              className={`w-4 bg-primary rounded-t-sm opacity-40 ${orderHeights[i]}`}
            />
            <div
              className={`w-4 bg-secondary rounded-t-sm ${revenueHeights[i]}`}
            />
          </div>
          <span className="text-xs text-on-surface-variant">{day}</span>
        </div>
      ))}
    </div>
  </div>
);
