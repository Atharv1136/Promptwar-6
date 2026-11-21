// ============================================================
// src/components/air/AqiSummary.tsx
// High-visibility AQI summary with color-independent geometric glyphs
// Per DESIGN.md §3 and ACCESSIBILITY.md §4
// ============================================================

import React from 'react';
import { AirSnapshot, RiskAssessment } from '@/lib/types';
import { AqiGlyph } from '../common/Icons';

interface AqiSummaryProps {
  snapshot: AirSnapshot;
  assessment?: RiskAssessment;
}

export function AqiSummary({ snapshot, assessment }: AqiSummaryProps) {
  const currentTier = assessment ? assessment.tier : snapshot.band;
  const isEscalated = assessment?.isEscalated;

  const bandColorClass = {
    Good: 'border-aqi-good text-aqi-good bg-aqi-good/5',
    Moderate: 'border-aqi-moderate text-aqi-moderate bg-aqi-moderate/5',
    UnhealthySensitive: 'border-aqi-sensitive text-aqi-sensitive bg-aqi-sensitive/5',
    Unhealthy: 'border-aqi-unhealthy text-aqi-unhealthy bg-aqi-unhealthy/5',
    VeryUnhealthy: 'border-aqi-veryUnhealthy text-aqi-veryUnhealthy bg-aqi-veryUnhealthy/5',
    Hazardous: 'border-aqi-hazardous text-aqi-hazardous bg-aqi-hazardous/5',
  }[currentTier];

  return (
    <div
      role="region"
      aria-label="Current Air Quality Summary"
      className="p-5 bg-surface border border-rule rounded space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block mb-1">
            Current Air Quality Index (US AQI)
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl md:text-5xl font-bold tabular-nums text-ink">
              {snapshot.aqi}
            </span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-sm font-semibold border ${bandColorClass}`}
            >
              <AqiGlyph band={currentTier} size={16} />
              <span>{currentTier}</span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-ink-muted space-y-0.5">
          <div>{snapshot.source}</div>
          <div className="tabular-nums">
            {snapshot.timestamp
              ? new Date(snapshot.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Live'}
          </div>
        </div>
      </div>

      {isEscalated && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-600/30 rounded text-xs text-amber-800 dark:text-amber-300">
          <strong>Vulnerability Alert:</strong> {assessment?.escalationReason}
        </div>
      )}

      {assessment?.maskGuidance && (
        <p className="text-xs text-ink-muted leading-relaxed">{assessment.maskGuidance}</p>
      )}
    </div>
  );
}
