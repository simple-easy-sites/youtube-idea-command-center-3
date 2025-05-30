
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', containerClassName = '', ...props }) => {
  // Ensure text-[var(--text-primary)] is applied and use inline style for stronger override if necessary.
  const baseStyles = 'w-full px-4 py-3 bg-gradient-to-b from-[var(--glass-bg-subtle-start)] to-[var(--glass-bg-subtle-end)] border border-[var(--glass-border-color)] rounded-xl placeholder-[var(--text-tertiary)] outline-none transition-all duration-300 ease-in-out shadow-md hover:border-[var(--glass-border-highlight)] hover:from-[var(--glass-bg-subtle-start)] hover:to-[var(--glass-bg-subtle-end)] focus:from-[var(--glass-bg-main-start)] focus:to-[var(--glass-bg-main-end)] transform hover:scale-[1.01] focus:scale-[1.01] apple-focus-glow';
  
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide">{label}</label>}
      <input
        id={id}
        className={`${baseStyles} text-[var(--text-primary)] ${className}`} // Ensure text color class is applied
        style={{ color: 'var(--text-primary)' }} // Inline style for stronger override of text color
        {...props}
      />
    </div>
  );
};