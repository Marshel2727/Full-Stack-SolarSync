import React from 'react';

export const SkeletonLoader: React.FC<{ className?: string; count?: number }> = ({
  className = 'h-6 w-full',
  count = 1,
}) => {
  return (
    <div role="status" aria-label="Memuat konten" className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          aria-hidden="true"
          className={`bg-slate-200/80 animate-pulse rounded-xl ${className}`}
        />
      ))}
    </div>
  );
};
