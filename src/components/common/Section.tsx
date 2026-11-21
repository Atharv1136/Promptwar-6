// ============================================================
// src/components/common/Section.tsx
// Semantic layout section with accessible heading & divider rule
// Per DESIGN.md §2, §3
// ============================================================

import React from 'react';

interface SectionProps {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  id,
  title,
  description,
  action,
  children,
  className = '',
}: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`pt-6 border-t border-rule space-y-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id={headingId} className="text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
}
