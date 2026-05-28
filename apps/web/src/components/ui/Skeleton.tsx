export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
);

export const SkeletonText = ({ className, lines = 1 }: { className?: string; lines?: number }) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-outline-variant rounded ${i < lines - 1 ? "mb-2" : ""}`}
        style={{ width: i === lines - 1 ? "70%" : "100%" }}
      />
    ))}
  </div>
);

export const SkeletonAttendaceCard = () => (
  <div className="bg-surface border border-outline-variant rounded-2xl p-6 animate-pulse">
    <div className="h-6 bg-outline-variant rounded w-3/4 mb-4" />
    <div className="h-10 bg-outline-variant rounded-lg w-full mb-3" />
    <div className="h-10 bg-outline-variant rounded-lg w-full" />
  </div>
);

export const SkeletonShiftCard = () => (
  <div className="bg-surface border border-outline-variant rounded-xl p-5 animate-pulse">
    <div className="h-5 bg-outline-variant rounded w-1/2 mb-3" />
    <div className="h-4 bg-outline-variant rounded w-3/4 mb-2" />
    <div className="h-4 bg-outline-variant rounded w-1/2" />
  </div>
);

export const SkeletonHistoryItem = () => (
  <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg animate-pulse">
    <div className="w-10 h-10 bg-outline-variant rounded-full" />
    <div className="flex-1">
      <div className="h-4 bg-outline-variant rounded w-3/4 mb-1" />
      <div className="h-3 bg-outline-variant rounded w-1/2" />
    </div>
  </div>
);