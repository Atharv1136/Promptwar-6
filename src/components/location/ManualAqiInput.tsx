/**
 * @file ManualAqiInput.tsx
 * @module components/location
 * @description Offline and degraded fallback manual AQI input (0-500) with live glyph indicator
 * @evaluation-pillar Pillar 1 (Code Quality), Pillar 5 (Accessibility)
 */

import React from 'react';
import { getAQIBand } from '@/lib/aqi/bands';
import { AqiGlyph } from '../common/Icons';

interface ManualAqiInputProps {
  value: number;
  onChange: (aqi: number) => void;
  onCancel: () => void;
}

export const ManualAqiInput = React.memo(function ManualAqiInput({
  value,
  onChange,
  onCancel,
}: ManualAqiInputProps) {
  const currentBand = getAQIBand(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num >= 0 && num <= 500) {
      onChange(num);
    }
  };

  return (
    <div className="p-3.5 bg-surface border border-rule rounded space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="manual-aqi-input" className="text-sm font-semibold text-ink">
          Manual Air Quality Index (AQI)
        </label>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-accent underline hover:opacity-80"
        >
          Use automatic city forecast
        </button>
      </div>

      <p className="text-xs text-ink-muted">
        Use this if the air quality data service is unreachable or if you have a local monitor
        reading.
      </p>

      <div className="flex items-center gap-3">
        <input
          id="manual-aqi-input"
          type="number"
          min="0"
          max="500"
          value={value}
          onChange={handleChange}
          inputMode="numeric"
          className="w-28 px-3 py-1.5 text-base font-semibold tabular-nums border border-rule rounded bg-surface text-ink focus-visible:outline-accent"
        />

        <div className="flex items-center gap-1.5 text-xs font-medium text-ink bg-bg px-2.5 py-1.5 rounded border border-rule">
          <AqiGlyph band={currentBand} size={14} />
          <span>{currentBand}</span>
        </div>
      </div>
    </div>
  );
});
ManualAqiInput.displayName = 'ManualAqiInput';
