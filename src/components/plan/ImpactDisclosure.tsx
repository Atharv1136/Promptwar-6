// ============================================================
// src/components/plan/ImpactDisclosure.tsx
// Transparent scientific assumptions disclosure per action item
// Per PRD.md §7 (FR4) and DESIGN.md §3
// ============================================================

import React from 'react';
import { ImpactEstimate } from '@/lib/types';
import { ASSUMPTIONS } from '@/lib/impact/assumptions';

interface ImpactDisclosureProps {
  impact?: ImpactEstimate;
}

export function ImpactDisclosure({ impact }: ImpactDisclosureProps) {
  if (!impact) {
    return null;
  }

  return (
    <details className="mt-2 text-xs border border-rule/60 rounded bg-bg/50 group">
      <summary className="p-2 font-medium cursor-pointer text-accent hover:underline flex items-center justify-between">
        <span>Estimated Direct Impact: {impact.headline}</span>
        <span className="text-[10px] text-ink-muted">View Assumptions ▾</span>
      </summary>

      <div className="p-2.5 pt-1 border-t border-rule/40 space-y-2 text-ink-muted leading-relaxed">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Calculated Range:</span>
          <span className="tabular-nums font-medium text-ink">
            {impact.low}–{impact.high} {impact.unit}
          </span>
          {impact.isIllustrative && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400">
              Illustrative Multiplier
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="font-semibold text-ink block">Documented Science & Assumptions:</span>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            {impact.assumptionIds.map((id) => {
              const asm = ASSUMPTIONS[id];
              if (!asm) return null;
              return (
                <li key={id}>
                  <strong className="text-ink">{asm.name}:</strong> {asm.description}{' '}
                  <span className="text-ink-muted">[{asm.sourceNote}]</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </details>
  );
}
