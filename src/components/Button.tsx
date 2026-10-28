import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles =
    'w-full inline-flex justify-center items-center gap-2 py-3.5 px-6 rounded-xl sm:rounded-2xl text-sm font-semibold tracking-wide transition duration-150 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary:
      'shadow-lg shadow-[var(--color-primary)]/20 text-white bg-gradient-to-r from-[var(--color-primary)] to-[#701824] hover:opacity-95 active:scale-[0.99] focus:ring-[var(--color-primary)]',
    secondary:
      'bg-stone-100 text-stone-800 hover:bg-stone-200 focus:ring-stone-400',
    outline:
      'border border-stone-300 text-stone-700 hover:bg-stone-50 focus:ring-stone-400'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {icon && (
        <span className="transition-transform transform group-hover:translate-x-1">
          {icon}
        </span>
      )}
    </button>
  );
};