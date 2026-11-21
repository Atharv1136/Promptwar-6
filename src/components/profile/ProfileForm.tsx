// ============================================================
// src/components/profile/ProfileForm.tsx
// Validated household profile form with steppers, fieldsets & local persistence
// Per PRD.md §6 and ACCESSIBILITY.md §2
// ============================================================

import React, { useState, useEffect } from 'react';
import { Profile, LocationInput } from '@/lib/types';
import { LocationPicker } from '../location/LocationPicker';
import { ManualAqiInput } from '../location/ManualAqiInput';
import { Button } from '../common/Button';

interface ProfileFormProps {
  initialProfile: Profile;
  onSubmit: (profile: Profile, manualAqi?: number) => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'saans_user_profile_v1';

export function ProfileForm({ initialProfile, onSubmit, isLoading }: ProfileFormProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isManualAqi, setIsManualAqi] = useState(false);
  const [manualAqi, setManualAqi] = useState<number>(150);
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(false);

  // Load from local storage if opt-in was previously checked
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          note: '', // Never restore free text per SECURITY.md §8
        }));
        setSaveToLocalStorage(true);
      }
    } catch {
      // Storage unavailable or corrupted
    }
  }, []);

  const handleLocationChange = (location: LocationInput) => {
    setProfile((prev) => ({ ...prev, location }));
  };

  const handleHouseholdCount = (field: 'adults' | 'seniors', delta: number) => {
    setProfile((prev) => {
      const current = prev.household[field];
      const updated = Math.max(0, Math.min(10, current + delta));
      return {
        ...prev,
        household: { ...prev.household, [field]: updated },
      };
    });
  };

  const handleChildrenCount = (band: 'under5' | 'age5to12' | 'age13to17', delta: number) => {
    setProfile((prev) => {
      const current = prev.household.children[band];
      const updated = Math.max(0, Math.min(10, current + delta));
      return {
        ...prev,
        household: {
          ...prev.household,
          children: { ...prev.household.children, [band]: updated },
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (saveToLocalStorage) {
      try {
        const toSave = { ...profile, note: undefined };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        // Storage full or private mode
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    onSubmit(profile, isManualAqi ? manualAqi : undefined);
  };

  const handleClearSaved = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSaveToLocalStorage(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Location Picker / Manual AQI */}
      <div className="bg-surface p-4 border border-rule rounded">
        {isManualAqi ? (
          <ManualAqiInput
            value={manualAqi}
            onChange={setManualAqi}
            onCancel={() => setIsManualAqi(false)}
          />
        ) : (
          <LocationPicker
            location={profile.location}
            onChange={handleLocationChange}
            onManualToggle={() => setIsManualAqi(true)}
          />
        )}
      </div>

      {/* 2. Household Members Fieldset */}
      <fieldset className="bg-surface p-4 border border-rule rounded space-y-4">
        <legend className="text-sm font-semibold text-ink px-1">Household Members</legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-ink-muted block mb-1">Adults (18–64)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleHouseholdCount('adults', -1)}
                className="w-8 h-8 flex items-center justify-center border border-rule rounded bg-bg text-ink hover:bg-rule"
                aria-label="Decrease adults"
              >
                -
              </button>
              <span className="w-8 text-center tabular-nums font-semibold text-sm">
                {profile.household.adults}
              </span>
              <button
                type="button"
                onClick={() => handleHouseholdCount('adults', 1)}
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
                onClick={() => handleHouseholdCount('seniors', -1)}
                className="w-8 h-8 flex items-center justify-center border border-rule rounded bg-bg text-ink hover:bg-rule"
                aria-label="Decrease seniors"
              >
                -
              </button>
              <span className="w-8 text-center tabular-nums font-semibold text-sm">
                {profile.household.seniors}
              </span>
              <button
                type="button"
                onClick={() => handleHouseholdCount('seniors', 1)}
                className="w-8 h-8 flex items-center justify-center border border-rule rounded bg-bg text-ink hover:bg-rule"
                aria-label="Increase seniors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-rule/60 space-y-2">
          <span className="text-xs font-medium text-ink block">Children by Age Group:</span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[11px] text-ink-muted block mb-1">Under 5 yrs</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleChildrenCount('under5', -1)}
                  className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                >
                  -
                </button>
                <span className="tabular-nums font-semibold text-xs w-4 text-center">
                  {profile.household.children.under5}
                </span>
                <button
                  type="button"
                  onClick={() => handleChildrenCount('under5', 1)}
                  className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
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
                  onClick={() => handleChildrenCount('age5to12', -1)}
                  className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                >
                  -
                </button>
                <span className="tabular-nums font-semibold text-xs w-4 text-center">
                  {profile.household.children.age5to12}
                </span>
                <button
                  type="button"
                  onClick={() => handleChildrenCount('age5to12', 1)}
                  className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
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
                  onClick={() => handleChildrenCount('age13to17', -1)}
                  className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
                >
                  -
                </button>
                <span className="tabular-nums font-semibold text-xs w-4 text-center">
                  {profile.household.children.age13to17}
                </span>
                <button
                  type="button"
                  onClick={() => handleChildrenCount('age13to17', 1)}
                  className="w-7 h-7 flex items-center justify-center border border-rule rounded bg-bg text-xs"
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
              checked={profile.household.hasSensitiveHealthMember}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  household: { ...prev.household, hasSensitiveHealthMember: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-accent focus:ring-accent"
            />
            <span>Someone in household has asthma, heart, or respiratory sensitivity</span>
          </label>
        </div>
      </fieldset>

      {/* 3. Lifestyle & Commute Fieldset */}
      <fieldset className="bg-surface p-4 border border-rule rounded space-y-3">
        <legend className="text-sm font-semibold text-ink px-1">Daily Commute & Lifestyle</legend>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="commute-select" className="text-xs text-ink-muted block mb-1">
              Main Commute Mode
            </label>
            <select
              id="commute-select"
              value={profile.lifestyle.commute}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  lifestyle: {
                    ...prev.lifestyle,
                    commute: e.target.value as Profile['lifestyle']['commute'],
                  },
                }))
              }
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
              value={profile.lifestyle.commuteDistance}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  lifestyle: {
                    ...prev.lifestyle,
                    commuteDistance: e.target.value as Profile['lifestyle']['commuteDistance'],
                  },
                }))
              }
              className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
            >
              <option value="lt3km">Under 3 km</option>
              <option value="3to10km">3 to 10 km</option>
              <option value="gt10km">Over 10 km</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* 4. Home Characteristics Fieldset */}
      <fieldset className="bg-surface p-4 border border-rule rounded space-y-3">
        <legend className="text-sm font-semibold text-ink px-1">
          Home Characteristics & Energy
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sealing-select" className="text-xs text-ink-muted block mb-1">
              Window Sealing
            </label>
            <select
              id="sealing-select"
              value={profile.home.sealing}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  home: {
                    ...prev.home,
                    sealing: e.target.value as Profile['home']['sealing'],
                  },
                }))
              }
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
              value={profile.home.cooking}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  home: {
                    ...prev.home,
                    cooking: e.target.value as Profile['home']['cooking'],
                  },
                }))
              }
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
              value={profile.home.purifier}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  home: {
                    ...prev.home,
                    purifier: e.target.value as Profile['home']['purifier'],
                  },
                }))
              }
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
              value={profile.budget}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  budget: e.target.value as Profile['budget'],
                }))
              }
              className="w-full px-2.5 py-1.5 text-xs bg-surface border border-rule rounded"
            >
              <option value="minimal">Minimal (Low cost / DIY)</option>
              <option value="moderate">Moderate</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* 5. Language & Optional Note */}
      <div className="bg-surface p-4 border border-rule rounded space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="language-select" className="text-sm font-semibold text-ink">
            Output Language
          </label>
          <select
            id="language-select"
            value={profile.language}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                language: e.target.value as Profile['language'],
              }))
            }
            className="px-2.5 py-1 text-xs bg-surface border border-rule rounded font-medium"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        <div>
          <label htmlFor="profile-note" className="text-xs text-ink-muted block mb-1">
            Additional Household Context (Optional, max 280 chars)
          </label>
          <textarea
            id="profile-note"
            maxLength={280}
            rows={2}
            value={profile.note || ''}
            onChange={(e) => setProfile((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="e.g. Toddler attends morning preschool; family takes evening walks..."
            className="w-full p-2 text-xs bg-surface text-ink border border-rule rounded focus-visible:outline-accent resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-ink-muted mt-1">
            <span>Do not enter private health details or medical history.</span>
            <span>{(profile.note || '').length}/280</span>
          </div>
        </div>
      </div>

      {/* 6. Opt-in Storage & Submit Action */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveToLocalStorage}
              onChange={(e) => setSaveToLocalStorage(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-accent"
            />
            <span>Remember household profile on this browser</span>
          </label>

          {saveToLocalStorage && (
            <button
              type="button"
              onClick={handleClearSaved}
              className="text-danger underline hover:opacity-80"
            >
              Clear saved profile
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full text-base font-semibold"
        >
          Build My Daily Smog Plan
        </Button>
      </div>
    </form>
  );
}
