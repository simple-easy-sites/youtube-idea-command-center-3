
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. text-blue-500
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-blue-500' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${color.replace('text-', 'border-')}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
