import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl shadow-lg focus:outline-none transition-all duration-300 ease-in-out inline-flex items-center justify-center transform active:scale-[0.96] active:brightness-90 border'; 
  
  const variantStyles = {
    primary: 'bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 hover:from-sky-400 hover:via-sky-500 hover:to-sky-600 border-sky-600 hover:border-sky-400 text-white focus:ring-2 focus:ring-sky-400/70 focus:ring-offset-2 focus:ring-offset-[var(--base-bg-end)] disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-sky-500/40 shadow-md',
    secondary: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 hover:from-slate-500 hover:via-slate-600 hover:to-slate-700 border-slate-500 hover:border-slate-400 text-gray-100 focus:ring-2 focus:ring-slate-400/70 focus:ring-offset-2 focus:ring-offset-[var(--base-bg-end)] disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-slate-500/30 shadow-md',
    danger: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 border-red-600 hover:border-red-400 text-white focus:ring-2 focus:ring-red-400/70 focus:ring-offset-2 focus:ring-offset-[var(--base-bg-end)] disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-red-500/40 shadow-md',
    ghost: 'bg-transparent border-transparent hover:bg-gray-700/50 hover:border-gray-600/70 text-gray-300 focus:ring-1 focus:ring-gray-500/80 disabled:opacity-50 hover:scale-[1.03] hover:text-white',
  };
  
  const sizeStyles = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${isLoading ? 'cursor-not-allowed !opacity-70' : ''} ${className} apple-focus-glow`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};