import { describe, it, expect } from 'vitest';
import { findOutdoorWindows } from '@/lib/aqi/windows';
import { HourlyReading } from '@/lib/types';

describe('Outdoor Windows & Ventilation Engine', () => {
  it('handles empty or missing hourly readings gracefully', () => {
    const res = findOutdoorWindows([]);
    expect(res.bestOutdoorWindows).toEqual([]);
    expect(res.worstOutdoorWindows).toEqual([]);
    expect(res.ventilationWindow).toBeNull();
  });

  it('accurately identifies best and worst activity windows from hourly data', () => {
    const series: HourlyReading[] = [
      { time: '2026-11-21T06:00', aqi: 195, pm25: 120, band: 'Unhealthy' },
      { time: '2026-11-21T08:00', aqi: 240, pm25: 180, band: 'VeryUnhealthy' }, // Peak morning inversion
      { time: '2026-11-21T14:00', aqi: 85, pm25: 28, band: 'Moderate' }, // Cleansing window
      { time: '2026-11-21T15:00', aqi: 80, pm25: 26, band: 'Moderate' },
      { time: '2026-11-21T20:00', aqi: 180, pm25: 105, band: 'Unhealthy' },
    ];

    const result = findOutdoorWindows(series);
    expect(result.bestOutdoorWindows[0]?.startHour).toBe(15);
    expect(result.bestOutdoorWindows[0]?.avgAqi).toBe(80);

    expect(result.worstOutdoorWindows[0]?.startHour).toBe(8);
    expect(result.worstOutdoorWindows[0]?.avgAqi).toBe(240);

    // 2-hour window 14:00-15:00 has avg AQI 82.5 (< 151), so ventilation is allowed
    expect(result.ventilationWindow).not.toBeNull();
    expect(result.ventilationWindow?.startHour).toBe(14);
  });

  it('suppresses ventilation window when all hours exceed Unhealthy threshold (AQI >= 151)', () => {
    const hazardousSeries: HourlyReading[] = [
      { time: '2026-11-21T06:00', aqi: 280, pm25: 220, band: 'VeryUnhealthy' },
      { time: '2026-11-21T10:00', aqi: 310, pm25: 260, band: 'Hazardous' },
      { time: '2026-11-21T14:00', aqi: 190, pm25: 130, band: 'Unhealthy' },
      { time: '2026-11-21T15:00', aqi: 185, pm25: 125, band: 'Unhealthy' },
    ];

    const result = findOutdoorWindows(hazardousSeries);
    expect(result.ventilationWindow).toBeNull();
  });
});
