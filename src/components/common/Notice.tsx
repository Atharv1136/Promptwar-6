// ============================================================
// src/components/common/Notice.tsx
// Status and warning banners with ARIA live region support
// Per DESIGN.md §5 and ACCESSIBILITY.md §6
// ============================================================

import React from 'react';
import { InfoIcon, WarningIcon } from './Icons';

interface NoticeProps {
  type?: 'info' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Notice({ type = 'info', title, children, className = '' }: NoticeProps) {
  const isError = type === 'error';
  const isWarning = type === 'warning';

  const role = isError ? 'alert' : 'status';
  const ariaLive = isError ? 'assertive' : 'polite';

  const borderClass = isError
    ? 'border-danger bg-danger/5 text-danger'
    : isWarning
      ? 'border-amber-600 bg-amber-500/5 text-amber-700 dark:text-amber-400'
      : 'border-accent bg-accent/5 text-ink';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`p-3.5 border rounded border-l-4 text-sm ${borderClass} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">
          {isError || isWarning ? <WarningIcon size={18} /> : <InfoIcon size={18} />}
        </div>
        <div className="space-y-1">
          {title && <h3 className="font-semibold text-ink leading-tight">{title}</h3>}
          <div className="text-ink-muted leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
