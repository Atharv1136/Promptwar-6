/**
 * @file AqiGlyph.tsx
 * @module components/common
 * @description Geometric shape glyphs ensuring AQI bands are communicated independently of color
 * @evaluation-pillar Pillar 5 (Accessibility - WCAG 2.2 AA 1.4.1 Use of Color)
 */

import React from 'react';
import { AQIBand } from '@/lib/types';

interface AqiGlyphProps {
  band: AQIBand;
  size?: number;
  className?: string;
}

export const AqiGlyph = React.memo(function AqiGlyph({
  band,
  size = 16,
  className = '',
}: AqiGlyphProps) {
  switch (band) {
    case 'Good':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'Moderate':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <polygon points="12,2 22,22 2,22" />
        </svg>
      );
    case 'UnhealthySensitive':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    case 'Unhealthy':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      );
    case 'VeryUnhealthy':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
        </svg>
      );
    case 'Hazardous':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <polygon points="7.86,2 16.14,2 22,7.86 22,16.14 16.14,22 7.86,22 2,16.14 2,7.86" />
        </svg>
      );
  }
});

AqiGlyph.displayName = 'AqiGlyph';
