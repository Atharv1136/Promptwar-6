// ============================================================
// src/lib/aqi/windows.ts
// Best/worst activity windows & thermal inversion ventilation schedule
// Per ARCHITECTURE.md §6 and PRD.md §7 (FR2)
// ============================================================

import { HourlyReading, OutdoorWindow } from '@/lib/types';

/**
 * Parses hourly series to detect best outdoor window, worst outdoor window,
 * and optimal 2-hour home ventilation window.
 */
export function findOutdoorWindows(hourly: HourlyReading[]): {
  bestOutdoorWindows: OutdoorWindow[];
  worstOutdoorWindows: OutdoorWindow[];
  ventilationWindow: OutdoorWindow | null;
} {
  if (!hourly || hourly.length === 0) {
    return {
      bestOutdoorWindows: [],
      worstOutdoorWindows: [],
      ventilationWindow: null,
    };
  }

  // Restrict analysis to next 24 hours
  const windowSlice = hourly.slice(0, 24);

  // Parse hours from time strings
  const parsed = windowSlice.map((h, index) => {
    let hour = index % 24;
    try {
      const d = new Date(h.time);
      if (!isNaN(d.getTime())) {
        hour = d.getHours();
      }
    } catch {
      // Fallback to index
    }
    return { hour, aqi: h.aqi, pm25: h.pm25 };
  });

  // 1. Identify minimum and maximum AQI single/contiguous windows
  let minAqi = Infinity;
  let maxAqi = -Infinity;
  let minHour = 14;
  let maxHour = 8;

  for (const item of parsed) {
    if (item.aqi < minAqi) {
      minAqi = item.aqi;
      minHour = item.hour;
    }
    if (item.aqi > maxAqi) {
      maxAqi = item.aqi;
      maxHour = item.hour;
    }
  }

  const bestOutdoorWindows: OutdoorWindow[] = [
    {
      startHour: minHour,
      endHour: (minHour + 2) % 24,
      avgAqi: Math.round(minAqi),
    },
  ];

  const worstOutdoorWindows: OutdoorWindow[] = [
    {
      startHour: maxHour,
      endHour: (maxHour + 2) % 24,
      avgAqi: Math.round(maxAqi),
    },
  ];

  // 2. Ventilation window: lowest 2-hour PM2.5 block in 24h, ONLY if average AQI < 151
  let bestVentilation: OutdoorWindow | null = null;
  let minTwoHourAvg = Infinity;

  for (let i = 0; i < parsed.length - 1; i++) {
    const first = parsed[i]!;
    const second = parsed[i + 1]!;
    const avgAqi = (first.aqi + second.aqi) / 2;
    const avgPm25 = (first.pm25 + second.pm25) / 2;

    if (avgPm25 < minTwoHourAvg) {
      minTwoHourAvg = avgPm25;
      if (avgAqi < 151) {
        bestVentilation = {
          startHour: first.hour,
          endHour: (second.hour + 1) % 24,
          avgAqi: Math.round(avgAqi),
        };
      }
    }
  }

  return {
    bestOutdoorWindows,
    worstOutdoorWindows,
    ventilationWindow: bestVentilation,
  };
}
