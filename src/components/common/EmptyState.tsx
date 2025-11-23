import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty state component for when there's no data to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-slate-300 dark:text-slate-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-primary dark:text-blue-400 font-semibold hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
