/**
 * @file AppFooter.tsx
 * @module components/layout
 * @description Application footer with data attribution, disclaimers and live sources
 */

import React from 'react';

export const AppFooter = React.memo(function AppFooter() {
  return (
    <footer className="pt-6 border-t border-rule text-xs text-ink-muted flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        Data sources:{' '}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          Open-Meteo Air Quality & Geocoding
        </a>{' '}
        • AI powered by Google Gemini
      </div>
      <div>Not medical advice • Stated assumptions documented transparently</div>
    </footer>
  );
});

AppFooter.displayName = 'AppFooter';
