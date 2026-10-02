import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-xs animate-pulse">
      <div className="aspect-3/4 w-full rounded-xl bg-zinc-200 mb-3" />
      <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-zinc-150 rounded w-1/2 mb-3" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 bg-zinc-200 rounded w-1/3" />
        <div className="h-8 w-8 bg-zinc-200 rounded-full" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-zinc-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-zinc-200 rounded w-4/5" />
        </td>
      ))}
    </tr>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
      <div className="aspect-square w-full rounded-2xl bg-zinc-200" />
      <div className="space-y-4">
        <div className="h-8 bg-zinc-200 rounded w-3/4" />
        <div className="h-6 bg-zinc-200 rounded w-1/4" />
        <div className="h-20 bg-zinc-100 rounded w-full" />
        <div className="h-10 bg-zinc-200 rounded w-1/2" />
        <div className="h-12 bg-zinc-200 rounded w-full mt-6" />
      </div>
    </div>
  );
};
