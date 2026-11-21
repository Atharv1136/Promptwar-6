/**
 * @file HouseholdFieldset.tsx
 * @module components/profile
 * @description Household members and health sensitivity demographic fieldset
 * @evaluation-pillar Pillar 1 (Code Quality), Pillar 5 (Accessibility)
 */

import React from 'react';
import { Profile } from '@/lib/types';

interface HouseholdFieldsetProps {
  household: Profile['household'];
  onHouseholdCount: (field: 'adults' | 'seniors', delta: number) => void;
  onChildrenCount: (band: 'under5' | 'age5to12' | 'age13to17', delta: number) => void;
  onSensitivityToggle: (checked: boolean) => void;
}

export const HouseholdFieldset = React.memo(function HouseholdFieldset({
  household,
  onHouseholdCount,
  onChildrenCount,
  onSensitivityToggle,
}: HouseholdFieldsetProps) {
  return (
    <fieldset className="bg-surface p-4 border border-rule rounded space-y-4">
      <legend className="text-sm font-semibold text-ink px-1">Household Members</legend>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-ink-muted block mb-1">Adults (18–64)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onHouseholdCount('adults', -1)}
              className="w-8 h-8 flex items-center justify-center border border-rule rounded bg-bg text-ink hover:bg-rule"
              aria-label="Decrease adults"
            >
              -
            </button>
            <span className="w-8 text-center tabular-nums font-semibold text-sm">
              {household.adults}
            </span>
            <button
              type="button"
              onClick={() => onHouseholdCount('adults', 1)}
              className="w-8 h-8 flex items-center justify-center border border-rule rounded bg-bg text-ink hover:bg-rule"
              aria-label="Increase adults"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs text-ink-muted block mb-1">Seniors (65+)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onHouseholdCount('seniors', -1)}
              className="w-8 h-8 flex items-center justify-center border border-rule rounded bg-bg text-ink hover:bg-rule"
              aria-label="Decrease seniors"
            >
              -
            </button>
            <span className="w-8 text-center tabular-nums font-semibold text-sm">
              {household.seniors}
            </span>
            <button
              type="button"
              onClick={() => onHouseholdCount('seniors', 1)}
              className="w-8 h-8 flex items-center justify-center border border-rule rounded bg-bg text-ink hover:bg-rule"
              aria-label="Increase seniors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-rule/60 space-y-2">
        <span className="text-xs font-medium text-ink block">Children by Age Group</span>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[11px] text-ink-muted block mb-1">Under 5</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChildrenCount('under5', -1)}
                className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                aria-label="Decrease children under 5"
              >
                -
              </button>
              <span className="tabular-nums font-semibold text-xs w-4 text-center">
                {household.children.under5}
              </span>
              <button
                type="button"
                onClick={() => onChildrenCount('under5', 1)}
                className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                aria-label="Increase children under 5"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-ink-muted block mb-1">Age 5–12</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChildrenCount('age5to12', -1)}
                className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                aria-label="Decrease children age 5 to 12"
              >
                -
              </button>
              <span className="tabular-nums font-semibold text-xs w-4 text-center">
                {household.children.age5to12}
              </span>
              <button
                type="button"
                onClick={() => onChildrenCount('age5to12', 1)}
                className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                aria-label="Increase children age 5 to 12"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-ink-muted block mb-1">Age 13–17</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChildrenCount('age13to17', -1)}
                className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                aria-label="Decrease children age 13 to 17"
              >
                -
              </button>
              <span className="tabular-nums font-semibold text-xs w-4 text-center">
                {household.children.age13to17}
              </span>
              <button
                type="button"
                onClick={() => onChildrenCount('age13to17', 1)}
                className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                aria-label="Increase children age 13 to 17"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-rule/60">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
          <input
            type="checkbox"
            checked={household.hasSensitiveHealthMember}
            onChange={(e) => onSensitivityToggle(e.target.checked)}
            className="w-4 h-4 rounded text-accent focus:ring-accent"
          />
          <span>Someone in household has asthma, heart, or respiratory sensitivity</span>
        </label>
      </div>
    </fieldset>
  );
});
HouseholdFieldset.displayName = 'HouseholdFieldset';
