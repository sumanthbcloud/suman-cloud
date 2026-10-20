import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  return (
    <div
      className={`${sizeClasses} rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center justify-center select-none shadow-xs`}
    >
      {initials}
    </div>
  );
};
