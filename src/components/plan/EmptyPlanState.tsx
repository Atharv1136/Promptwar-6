/**
 * @file EmptyPlanState.tsx
 * @module components/plan
 * @description Guidance placeholder when no 24-hour smog plan has been generated yet
 */

import React from 'react';

export const EmptyPlanState = React.memo(function EmptyPlanState() {
  return (
    <div className="p-8 bg-surface border border-dashed border-rule rounded text-center space-y-3">
      <div className="w-10 h-10 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-lg">
        🌬️
      </div>
      <h3 className="text-sm font-semibold text-ink">No Plan Generated Yet</h3>
      <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
        Enter your location and household profile on the left and click &ldquo;Generate 24-Hour
        Action Plan&rdquo; to receive your personalized routine, ventilation schedule, and impact
        estimates.
      </p>
    </div>
  );
});

EmptyPlanState.displayName = 'EmptyPlanState';
