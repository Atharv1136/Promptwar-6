// ============================================================
// src/components/profile/ProfileForm.tsx
// Validated household profile form orchestrating decomposed fieldsets
// Per PRD.md §6 and ACCESSIBILITY.md §2 (Strictly <= 200 lines)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Profile, LocationInput } from '@/lib/types';
import { LocationPicker } from '../location/LocationPicker';
import { ManualAqiInput } from '../location/ManualAqiInput';
import { HouseholdFieldset } from './HouseholdFieldset';
import { CommuteFieldset } from './CommuteFieldset';
import { HomeFieldset } from './HomeFieldset';
import { Button } from '../common/Button';

interface ProfileFormProps {
  initialProfile: Profile;
  onSubmit: (profile: Profile, manualAqi?: number) => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'saans_user_profile_v1';

export const ProfileForm = React.memo(function ProfileForm({
  initialProfile,
  onSubmit,
  isLoading,
}: ProfileFormProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [isManualAqi, setIsManualAqi] = useState(false);
  const [manualAqi, setManualAqi] = useState<number>(150);
  const [saveToLocalStorage, setSaveToLocalStorage] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile((prev) => ({ ...prev, ...parsed, note: '' }));
        setSaveToLocalStorage(true);
      }
    } catch {
      // Storage unavailable or blocked
    }
  }, []);

  const handleHouseholdCount = (field: 'adults' | 'seniors', delta: number) => {
    setProfile((prev) => ({
      ...prev,
      household: {
        ...prev.household,
        [field]: Math.max(0, Math.min(10, prev.household[field] + delta)),
      },
    }));
  };

  const handleChildrenCount = (band: 'under5' | 'age5to12' | 'age13to17', delta: number) => {
    setProfile((prev) => ({
      ...prev,
      household: {
        ...prev.household,
        children: {
          ...prev.household.children,
          [band]: Math.max(0, Math.min(10, prev.household.children[band] + delta)),
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveToLocalStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...profile, note: undefined }));
      } catch {
        // Storage full or private mode
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    onSubmit(profile, isManualAqi ? manualAqi : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            onChange={(location: LocationInput) => setProfile((p) => ({ ...p, location }))}
            onManualToggle={() => setIsManualAqi(true)}
          />
        )}
      </div>

      <HouseholdFieldset
        household={profile.household}
        onHouseholdCount={handleHouseholdCount}
        onChildrenCount={handleChildrenCount}
        onSensitivityToggle={(checked) =>
          setProfile((p) => ({
            ...p,
            household: { ...p.household, hasSensitiveHealthMember: checked },
          }))
        }
      />

      <CommuteFieldset
        commute={profile.lifestyle.commute}
        commuteDistance={profile.lifestyle.commuteDistance}
        onChange={(field, value) =>
          setProfile((p) => ({ ...p, lifestyle: { ...p.lifestyle, [field]: value } }))
        }
      />

      <HomeFieldset
        home={profile.home}
        budget={profile.budget}
        onHomeChange={(field, value) =>
          setProfile((p) => ({ ...p, home: { ...p.home, [field]: value } }))
        }
        onBudgetChange={(value) => setProfile((p) => ({ ...p, budget: value }))}
      />

      <div className="bg-surface p-4 border border-rule rounded space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="language-select" className="text-sm font-semibold text-ink">
            Output Language
          </label>
          <select
            id="language-select"
            value={profile.language}
            onChange={(e) =>
              setProfile((p) => ({ ...p, language: e.target.value as Profile['language'] }))
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
            onChange={(e) => setProfile((p) => ({ ...p, note: e.target.value }))}
            placeholder="e.g. Toddler attends morning preschool; family takes evening walks..."
            className="w-full p-2 text-xs bg-surface text-ink border border-rule rounded focus-visible:outline-accent resize-none"
          />
          <div className="flex justify-between items-center text-[11px] text-ink-muted mt-1">
            <span>Do not enter private health details or medical history.</span>
            <span>{(profile.note || '').length}/280</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveToLocalStorage}
              onChange={(e) => setSaveToLocalStorage(e.target.checked)}
              className="w-4 h-4 rounded text-accent focus:ring-accent"
            />
            <span>Remember this profile on this device (local storage only)</span>
          </label>
          {saveToLocalStorage && (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setSaveToLocalStorage(false);
              }}
              className="text-accent underline text-xs hover:text-accent/80"
            >
              Clear saved
            </button>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
          {isLoading ? 'Building My Daily Smog Plan...' : 'Build My Daily Smog Plan'}
        </Button>
      </div>
    </form>
  );
});

ProfileForm.displayName = 'ProfileForm';
