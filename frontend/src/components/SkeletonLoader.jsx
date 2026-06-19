import React from 'react';

export default function SkeletonLoader({ rows = 5 }) {
  return (
    <div className="w-full animate-pulse">
      <div className="h-12 bg-neutral-100 border-b border-neutral-200 w-full mb-2 rounded-t-xl" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex px-6 py-4 border-b border-neutral-100 gap-4">
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          <div className="h-4 bg-neutral-200 rounded w-1/6" />
          <div className="h-4 bg-neutral-200 rounded w-1/6" />
          <div className="h-4 bg-neutral-200 rounded w-1/6" />
          <div className="h-4 bg-neutral-200 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}
