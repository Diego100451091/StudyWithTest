import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

/**
 * Reusable card container component
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  border = true,
  hover = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const borderClass = border ? 'border border-slate-200 dark:border-slate-700' : '';
  const hoverClass = hover ? 'hover:shadow-md transition-shadow' : '';

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm ${paddingClasses[padding]} ${borderClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};
