"use client";

export function TaskSkeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-surface border border-outline-variant rounded-xl p-4 animate-pulse ${className ?? ""}`}>
      <div className="flex justify-between mb-3">
        <div className="w-20 h-6 bg-outline-variant/50 rounded-full" />
        <div className="w-16 h-4 bg-outline-variant/50 rounded" />
      </div>
      <div className="h-5 bg-outline-variant/50 rounded w-3/4 mb-2" />
      <div className="h-4 bg-outline-variant/50 rounded w-full mb-4" />
      <div className="h-10 bg-outline-variant/50 rounded-lg w-full" />
    </div>
  );
}
