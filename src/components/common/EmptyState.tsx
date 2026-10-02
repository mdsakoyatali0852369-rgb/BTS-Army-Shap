import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-4 shadow-sm">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-full bg-zinc-900 text-white hover:bg-purple-900 text-sm font-semibold transition-all shadow-sm active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
