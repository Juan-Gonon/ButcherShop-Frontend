import React from 'react';
import { Badge } from './Badge';

interface HeaderProps {
  title: string;
  subtitle: string;
  brandName: string;
  brandTagline: string;
  brandIcon?: React.ReactNode;
  statusText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  brandName,
  brandTagline,
  brandIcon,
  statusText = 'Conectado'
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-8">
        <div className="inline-flex items-center gap-3">
          {brandIcon && (
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary via-[#701824] to-[#540c17] border border-amber-400/30 flex items-center justify-center shadow-md shadow-primary/10 text-white">
              {brandIcon}
            </div>
          )}
          <div>
            <span className="text-base font-bold font-serif tracking-tight text-stone-900 block leading-tight">
              {brandName}
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase text-primary/80">
              {brandTagline}
            </span>
          </div>
        </div>

        {statusText && <Badge className="hidden sm:inline-flex">{statusText}</Badge>}
      </div>

      <div className="space-y-1.5 mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-normal">
          {subtitle}
        </p>
      </div>
    </div>
  );
};