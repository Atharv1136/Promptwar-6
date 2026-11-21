// ============================================================
// src/components/location/LocationPicker.tsx
// Accessible ARIA 1.2 Combobox with debounced geocoding & geolocation
// Per PRD.md §5, §6 and ACCESSIBILITY.md §2
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { LocationInput } from '@/lib/types';
import { LocationPinIcon } from '../common/Icons';
import { Button } from '../common/Button';

interface LocationPickerProps {
  location: LocationInput;
  onChange: (loc: LocationInput) => void;
  onManualToggle?: () => void;
}

interface GeocodeSearchResult extends LocationInput {
  admin?: string;
  country?: string;
}

export function LocationPicker({ location, onChange, onManualToggle }: LocationPickerProps) {
  const [query, setQuery] = useState(location.name || '');
  const [results, setResults] = useState<GeocodeSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (query.trim().length < 2 || query === location.name) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setResults(json.data);
          setIsOpen(json.data.length > 0);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, location.name]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationInput) => {
    onChange(loc);
    setQuery(loc.name);
    setIsOpen(false);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        const lat = Math.round(pos.coords.latitude * 100) / 100;
        const lon = Math.round(pos.coords.longitude * 100) / 100;
        const name = `My Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
        onChange({ name, lat, lon });
        setQuery(name);
      },
      (err) => {
        setIsGeolocating(false);
        setGeoError(`Location access denied (${err.message}). Enter city name manually.`);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="city-search" className="block text-sm font-semibold text-ink">
          Your Location (City or Area) <span className="text-danger">*</span>
        </label>
        {onManualToggle && (
          <button
            type="button"
            onClick={onManualToggle}
            className="text-xs text-accent underline hover:opacity-80"
          >
            Enter AQI manually
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="city-search"
              type="text"
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-controls="city-results"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city (e.g. Pune, Delhi, Lucknow)..."
              className="w-full px-3 py-2 text-sm bg-surface text-ink border border-rule rounded focus-visible:outline-accent"
            />
            {isSearching && (
              <span className="absolute right-3 top-2.5 text-xs text-ink-muted">Searching...</span>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGeolocation}
            disabled={isGeolocating}
            className="shrink-0 flex items-center gap-1.5"
            aria-label="Use current browser location"
          >
            <LocationPinIcon size={14} />
            <span>{isGeolocating ? 'Locating...' : 'Use My GPS'}</span>
          </Button>
        </div>

        {isOpen && results.length > 0 && (
          <ul
            id="city-results"
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-surface border border-rule rounded shadow-lg max-h-56 overflow-y-auto text-sm"
          >
            {results.map((loc, idx) => (
              <li
                key={`${loc.lat}-${loc.lon}-${idx}`}
                role="option"
                aria-selected={loc.name === location.name}
                onClick={() => handleSelect(loc)}
                className="px-3 py-2 cursor-pointer hover:bg-accent/10 border-b border-rule/50 last:border-b-0"
              >
                <span className="font-medium text-ink">{loc.name}</span>
                {loc.admin && <span className="text-xs text-ink-muted ml-1">({loc.admin})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {geoError && <p className="text-xs text-danger">{geoError}</p>}
    </div>
  );
}
