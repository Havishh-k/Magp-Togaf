import React from 'react';
import { Skeleton } from './ui/skeleton';

export default function SkeletonLoader({ rows = 5 }) {
  return (
    <div className="w-full">
      <Skeleton className="h-12 w-full mb-2 rounded-t-md" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex px-6 py-4 border-b border-border gap-4 items-center">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );
}
