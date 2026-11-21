/**
 * @file HomeFieldset.tsx
 * @module components/profile
 * @description Home sealing, cooking fuel, air purifier, and budget options
 * @evaluation-pillar Pillar 1 (Code Quality), Pillar 5 (Accessibility)
 */

import React from 'react';
import { Profile } from '@/lib/types';

interface HomeFieldsetProps {
  home: Profile['home'];
  budget: Profile['budget'];
  onHomeChange: (field: keyof Profile['home'], value: string) => void;
  onBudgetChange: (value: Profile['budget']) => void;
}

export const HomeFieldset = React.memo(function HomeFieldset({
  home,
  budget,
  onHomeChange,
  onBudgetChange,
}: HomeFieldsetProps) {
  return (
    <fieldset className="bg-surface p-4 border border-rule rounded space-y-3">
      <legend className="text-sm font-semibold text-ink px-1">Home Characteristics & Energy</legend>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="sealing-select" className="text-xs text-ink-muted block mb-1">
            Window Sealing
          </label>
          <select
            id="sealing-select"
            value={home.sealing}
            onChange={(e) => onHomeChange('sealing', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
          >
            <option value="well_sealed">Well Sealed (Modern frames)</option>
            <option value="average">Average Sealing</option>
            <option value="leaky">Leaky (Drafts / gaps)</option>
          </select>
        </div>

        <div>
          <label htmlFor="cooking-select" className="text-xs text-ink-muted block mb-1">
            Cooking Fuel
          </label>
          <select
            id="cooking-select"
            value={home.cooking}
            onChange={(e) => onHomeChange('cooking', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
          >
            <option value="electric">Electric / Induction</option>
            <option value="lpg_png">LPG / PNG Gas</option>
            <option value="biomass">Biomass (Wood / Chulha)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rule/60">
        <div>
          <label htmlFor="purifier-select" className="text-xs text-ink-muted block mb-1">
            Air Purifier
          </label>
          <select
            id="purifier-select"
            value={home.purifier}
            onChange={(e) => onHomeChange('purifier', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
          >
            <option value="none">None</option>
            <option value="hepa">HEPA Air Purifier</option>
            <option value="other">Other / Unknown</option>
          </select>
        </div>

        <div>
          <label htmlFor="budget-select" className="text-xs text-ink-muted block mb-1">
            Intervention Budget
          </label>
          <select
            id="budget-select"
            value={budget}
            onChange={(e) => onBudgetChange(e.target.value as Profile['budget'])}
            className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
          >
            <option value="minimal">Minimal (Low cost / DIY)</option>
            <option value="moderate">Moderate</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
});

HomeFieldset.displayName = 'HomeFieldset';
