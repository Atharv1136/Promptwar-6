// ============================================================
// src/components/common/Button.tsx
// Accessible button primitive with clear focus indicators and states
// Per DESIGN.md §2 and ACCESSIBILITY.md §3
// ============================================================

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent text-accent-ink hover:opacity-90 active:opacity-100',
    secondary: 'bg-surface text-ink border border-rule hover:bg-bg',
    outline: 'border border-accent text-accent hover:bg-accent hover:text-accent-ink',
    danger: 'bg-danger text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 min-h-[40px]',
    lg: 'text-base px-5 py-2.5 min-h-[44px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
