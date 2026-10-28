import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  dotColor?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  dotColor = 'bg-emerald-500',
  className = ''
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-[#ecdccb] text-[11px] font-medium text-stone-600 ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span>{children}</span>
    </div>
  );
};