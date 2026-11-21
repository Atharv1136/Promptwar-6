/**
 * @file CommuteFieldset.tsx
 * @module components/profile
 * @description Daily commute mode and distance configuration fieldset
 * @evaluation-pillar Pillar 1 (Code Quality), Pillar 5 (Accessibility)
 */

import React from 'react';
import { Profile } from '@/lib/types';

interface CommuteFieldsetProps {
  commute: Profile['lifestyle']['commute'];
  commuteDistance: Profile['lifestyle']['commuteDistance'];
  onChange: (field: keyof Profile['lifestyle'], value: string) => void;
}

export const CommuteFieldset = React.memo(function CommuteFieldset({
  commute,
  commuteDistance,
  onChange,
}: CommuteFieldsetProps) {
  return (
    <fieldset className="bg-surface p-4 border border-rule rounded space-y-3">
      <legend className="text-sm font-semibold text-ink px-1">Daily Commute & Lifestyle</legend>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="commute-select" className="text-xs text-ink-muted block mb-1">
            Main Commute Mode
          </label>
          <select
            id="commute-select"
            value={commute}
            onChange={(e) => onChange('commute', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
          >
            <option value="walk">Walking</option>
            <option value="cycle">Cycling</option>
            <option value="two_wheeler">Two-Wheeler (Motorbike/Scooter)</option>
            <option value="car">Private Car</option>
            <option value="transit">Public Transit (Metro/Bus)</option>
            <option value="work_from_home">Work from Home (WFH)</option>
          </select>
        </div>

        <div>
          <label htmlFor="distance-select" className="text-xs text-ink-muted block mb-1">
            One-Way Distance
          </label>
          <select
            id="distance-select"
            value={commuteDistance}
            onChange={(e) => onChange('commuteDistance', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
          >
            <option value="lt3km">Under 3 km</option>
            <option value="3to10km">3 to 10 km</option>
            <option value="gt10km">Over 10 km</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
});

CommuteFieldset.displayName = 'CommuteFieldset';
