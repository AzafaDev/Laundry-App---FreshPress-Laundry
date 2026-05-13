export const ProgressCard = () => (
  <div className="md:col-span-2 lg:col-span-1 bg-surface-container-low border border-outline-variant rounded-xl p-6 flex items-center gap-6">
    <div className="flex-1">
      <p className="text-sm text-on-surface-variant mb-1">Today's Progress</p>
      <h4 className="text-lg font-bold mb-2">24/40 Orders Completed</h4>
      <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
        <div className="bg-primary h-full w-[60%] rounded-full" />
      </div>
    </div>
    <div className="text-center">
      <p className="text-4xl font-bold text-primary">60%</p>
    </div>
  </div>
);
