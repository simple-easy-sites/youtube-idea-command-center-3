import React, { useState, useRef, useEffect } from 'react';

interface CollapsibleSectionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  // Updated SVG path for a filled chevron, commonly seen in UI libraries
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(defaultOpen ? 'auto' : '0px');

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isOpen, children]); // Recalculate on children change too

  return (
    <div className={`glass-card-subtle rounded-xl overflow-hidden ${className} transition-shadow hover:shadow-xl`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-4 md:p-5 text-left hover:bg-gradient-to-r hover:from-[var(--glass-bg-main-start)] hover:via-[var(--glass-bg-subtle-end)] hover:to-[var(--glass-bg-main-start)] transition-all duration-300 group ${headerClassName}`}
        aria-expanded={isOpen}
      >
        <div className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] group-hover:text-sky-300 transition-colors duration-300">{title}</div>
        <ChevronDownIcon 
            className={`transform transition-all duration-300 ease-out ${isOpen ? 'rotate-180 text-sky-400' : 'text-[var(--text-secondary)]'} group-hover:text-sky-300 group-hover:scale-110`} 
        />
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: contentHeight, opacity: isOpen ? 1 : 0 }}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'mt-0' : '-mt-1'}`} 
      >
        {(isOpen || contentHeight !== '0px') && (
          <div className={`p-4 md:p-6 border-t border-[var(--glass-border-color)] bg-black/10 ${contentClassName}`}> {/* Subtle bg for content area */}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};