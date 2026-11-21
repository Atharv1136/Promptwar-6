/**
 * @file ForecastStrip.tsx
 * @module components/air
 * @description 24-48h Hourly Forecast with Native SVG Sparkline & WCAG SC 1.1.1 Twin Representation
 * @evaluation-pillar Pillar 1 (Code Quality), Pillar 3 (Efficiency), Pillar 5 (Accessibility)
 */

import React from 'react';
import { HourlyReading, OutdoorWindow } from '@/lib/types';
import { AqiGlyph } from '../common/Icons';

interface ForecastStripProps {
  hourly: HourlyReading[];
  bestWindows?: OutdoorWindow[];
  worstWindows?: OutdoorWindow[];
  ventilationWindow?: OutdoorWindow | null;
}

export const ForecastStrip = React.memo(function ForecastStrip({
  hourly,
  bestWindows = [],
  worstWindows = [],
  ventilationWindow,
}: ForecastStripProps) {
  if (!hourly || hourly.length === 0) {
    return (
      <div className="p-4 bg-surface border border-rule rounded text-xs text-ink-muted">
        Hourly forecast data is unavailable for manual readings.
      </div>
    );
  }

  const slice24 = hourly.slice(0, 24);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 60;
  const aqiValues = slice24.map((h) => h.aqi);
  const minAqi = Math.min(...aqiValues, 0);
  const maxAqi = Math.max(...aqiValues, 300);

  // Generate SVG path points
  const points = slice24.map((h, idx) => {
    const x = (idx / (slice24.length - 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - 10 - ((h.aqi - minAqi) / (maxAqi - minAqi || 1)) * (svgHeight - 20);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  const bestHour = bestWindows[0]?.startHour;
  const worstHour = worstWindows[0]?.startHour;

  return (
    <div className="bg-surface border border-rule rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">24-Hour Air Quality Forecast</h3>
        <div className="flex items-center gap-2 text-xs">
          {bestHour !== undefined && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
              Best Outside: {bestHour}:00
            </span>
          )}
          {worstHour !== undefined && (
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium">
              Worst Smog Peak: {worstHour}:00
            </span>
          )}
        </div>
      </div>

      {/* 1. Screen Reader Structured Twin (WCAG SC 1.1.1) */}
      <ul className="sr-only" aria-label="Hourly air quality forecast description">
        {slice24.map((h, i) => (
          <li key={i}>
            Hour {h.time}: AQI is {h.aqi}, Category {h.band}, PM2.5 is {h.pm25} micrograms per cubic
            meter.
          </li>
        ))}
      </ul>

      {/* 2. Pure Native SVG Sparkline Trend (Zero-bloat, no Recharts/Chart.js) */}
      <div className="w-full overflow-hidden" aria-hidden="true">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-12 stroke-accent fill-none"
          role="presentation"
        >
          <path d={pathD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 3. Horizontal Scrollable Hourly Tiles */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 focus:outline-none"
        tabIndex={0}
        aria-label="Hourly tiles scrollable list"
      >
        {slice24.map((h, idx) => {
          const hourLabel = h.time ? new Date(h.time).getHours() + ':00' : `${idx}:00`;
          const isBest =
            bestHour !== undefined && h.time && new Date(h.time).getHours() === bestHour;
          const isWorst =
            worstHour !== undefined && h.time && new Date(h.time).getHours() === worstHour;

          return (
            <div
              key={idx}
              className={`flex-shrink-0 w-16 p-2 rounded text-center border text-xs space-y-1 ${
                isBest
                  ? 'border-emerald-600 bg-emerald-500/10 font-bold'
                  : isWorst
                    ? 'border-rose-600 bg-rose-500/10 font-bold'
                    : 'border-rule bg-bg'
              }`}
            >
              <div className="text-[11px] text-ink-muted">{hourLabel}</div>
              <div className="tabular-nums font-semibold">{h.aqi}</div>
              <div className="flex justify-center">
                <AqiGlyph band={h.band} size={12} />
              </div>
            </div>
          );
        })}
      </div>

      {ventilationWindow && (
        <div className="text-xs text-ink-muted pt-2 border-t border-rule/60">
          <strong>Optimal Ventilation Window:</strong> Safest time to briefly open windows for clean
          air exchange is{' '}
          <span className="font-semibold text-accent">
            {ventilationWindow.startHour}:00 to {ventilationWindow.endHour}:00
          </span>{' '}
          (Average AQI ~{ventilationWindow.avgAqi}).
        </div>
      )}
    </div>
  );
});
ForecastStrip.displayName = 'ForecastStrip';
