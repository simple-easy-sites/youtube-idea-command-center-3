import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  containerClassName?: string;
  placeholder?: string; 
}

export const Select: React.FC<SelectProps> = ({ label, id, options, className = '', containerClassName = '', placeholder, ...restProps }) => {
  const baseStyles = 'w-full pl-4 pr-10 py-3 bg-gradient-to-b from-[var(--glass-bg-subtle-start)] to-[var(--glass-bg-subtle-end)] border border-[var(--glass-border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none transition-all duration-300 ease-in-out shadow-md appearance-none hover:border-[var(--glass-border-highlight)] hover:from-[var(--glass-bg-subtle-start)] hover:to-[var(--glass-bg-subtle-end)] focus:from-[var(--glass-bg-main-start)] focus:to-[var(--glass-bg-main-end)] transform hover:scale-[1.01] focus:scale-[1.01] apple-focus-glow';
  
  return (
    <div className={`relative w-full ${containerClassName}`}>
      {label && <label htmlFor={id} className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide">{label}</label>}
      <select
        id={id}
        className={`${baseStyles} ${className}`}
        {...restProps}
      >
        {placeholder && <option value="" disabled className="bg-[var(--base-bg-end)] text-[var(--text-tertiary)]">{placeholder}</option>}
        {options.map(option => (
          <option 
            key={option.value} 
            value={option.value} 
            className="bg-[var(--base-bg-end)] text-[var(--text-primary)] hover:bg-sky-700" // Updated option style
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};