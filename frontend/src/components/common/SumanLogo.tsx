import React from 'react';

interface SumanLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SumanLogo: React.FC<SumanLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-base' },
    md: { icon: 'w-7 h-7', text: 'text-lg' },
    lg: { icon: 'w-9 h-9', text: 'text-xl' },
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className={`flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm ${sizeClasses.icon}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/6 h-4/6"
        >
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      </div>

      <span className={`font-bold tracking-tight text-slate-900 ${sizeClasses.text}`}>
        SUMAN
      </span>
    </div>
  );
};
