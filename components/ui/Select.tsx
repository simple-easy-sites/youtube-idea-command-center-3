

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
  const baseStyles = 'w-full pl-4 pr-10 py-3 bg-gradient-to-b from-[var(--glass-bg-subtle-start)] to-[var(--glass-bg-subtle-end)] border border-[var(--glass-border-color)] rounded-xl focus:outline-none transition-all duration-300 ease-in-out shadow-md appearance-none hover:border-[var(--glass-border-highlight)] hover:from-[var(--glass-bg-subtle-start)] hover:to-[var(--glass-bg-subtle-end)] focus:from-[var(--glass-bg-main-start)] focus:to-[var(--glass-bg-main-end)] transform hover:scale-[1.01] focus:scale-[1.01] apple-focus-glow';
  
  const placeholderOptionStyle = "text-[var(--text-tertiary)] bg-[var(--base-bg-end)]";
  const optionStyle = "text-[var(--text-primary)] bg-[var(--base-bg-end)] hover:bg-sky-700";


  return (
    <div className={`relative w-full ${containerClassName} group`}>
      {label && <label htmlFor={id} className="block text-sm font-semibold text-[var(--text-secondary)] mb-2 tracking-wide">{label}</label>}
      <div className="relative flex items-center"> {/* Wrapper to help center arrow and select text more consistently */}
        <select
          id={id}
          className={`${baseStyles} text-[var(--text-primary)] ${className} ${restProps.value === "" && placeholder ? '!text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}
          style={{ color: (restProps.value === "" && placeholder) ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
          {...restProps}
        >
          {placeholder && <option value="" disabled className={placeholderOptionStyle}>{placeholder}</option>}
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value} 
              className={optionStyle}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
          {/* Using a more standard chevron that's easier to center visually */}
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};