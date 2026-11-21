// ============================================================
// src/app/page.tsx
// Main Application Page (Saans — Winter Smog Companion)
// Two-column layout, reactive states, and WCAG 2.2 AA accessibility
// Per DESIGN.md §3 and PRD.md §5
// ============================================================

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Profile, AirSnapshot, Plan, RiskAssessment, ImpactEstimate } from '@/lib/types';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AqiSummary } from '@/components/air/AqiSummary';
import { PollutantTable } from '@/components/air/PollutantTable';
import { ForecastStrip } from '@/components/air/ForecastStrip';
import { PlanView } from '@/components/plan/PlanView';
import { CommunityPledgeSection } from '@/components/plan/CommunityPledgeSection';
import { Notice } from '@/components/common/Notice';

// Lazy-load grounded Q&A chat panel to preserve ultra-light initial bundle
const AskPanel = dynamic(() => import('@/components/chat/AskPanel').then((mod) => mod.AskPanel), {
  ssr: false,
});

const DEFAULT_PROFILE: Profile = {
  location: { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
  household: {
    adults: 2,
    children: { under5: 0, age5to12: 1, age13to17: 0 },
    seniors: 0,
    hasSensitiveHealthMember: false,
  },
  lifestyle: {
    commute: 'two_wheeler',
    commuteDistance: '3to10km',
  },
  home: {
    type: 'apartment',
    sealing: 'average',
    cooking: 'lpg_png',
    heating: 'none',
    purifier: 'none',
  },
  budget: 'minimal',
  language: 'en',
  note: '',
};

export default function HomePage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [snapshot, setSnapshot] = useState<AirSnapshot | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [impacts, setImpacts] = useState<ImpactEstimate[]>([]);
  const [source, setSource] = useState<'ai' | 'fallback'>('fallback');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuildPlan = async (submittedProfile: Profile, manualAqi?: number) => {
    setIsLoading(true);
    setError(null);
    setProfile(submittedProfile);

    try {
      let resolvedSnapshot: AirSnapshot | undefined = undefined;

      // 1. Fetch live air telemetry if manual AQI is not provided
      if (manualAqi === undefined) {
        const { lat, lon } = submittedProfile.location;
        const aqRes = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
        const aqJson = await aqRes.json();

        if (aqJson.ok && aqJson.data) {
          const fetchedSnapshot = aqJson.data as AirSnapshot;
          resolvedSnapshot = fetchedSnapshot;
          setSnapshot(fetchedSnapshot);
        } else {
          // If Open-Meteo fails, prompt user to use manual input
          throw new Error(
            'Unable to reach live air quality data. Please toggle "Enter AQI manually" to continue.'
          );
        }
      }

      // 2. Request personalized plan from server
      const planRes = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: submittedProfile,
          snapshot: resolvedSnapshot,
          manualAqi,
        }),
      });

      const planJson = await planRes.json();
      if (planJson.ok && planJson.data) {
        setPlan(planJson.data.plan);
        setAssessment(planJson.data.assessment);
        setImpacts(planJson.data.impacts);
        setSource(planJson.data.source);
      } else {
        throw new Error(planJson.error?.message || 'Failed to generate plan.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Application Header */}
      <header className="border-b border-rule pb-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Saans</h1>
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-accent/10 text-accent border border-accent/20">
              Winter Smog Companion
            </span>
          </div>
          <span className="text-xs text-ink-muted">Free, open public health tool</span>
        </div>

        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-3xl">
          A hybrid GenAI assistant helping households navigate severe winter smog and urban air
          stagnation. Generates low-emission routines, indoor air hacks, and clean alternatives
          tailored to your location, family health vulnerability, and home building profile. No data
          is stored on a server.
        </p>
      </header>

      {/* Main Two-Column Layout */}
      <main id="main-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Inputs (40% width on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-ink">Your Household & Lifestyle Profile</h2>
            <p className="text-xs text-ink-muted">
              Fill in your details below to build your tailored daily schedule.
            </p>
          </div>

          <ProfileForm initialProfile={profile} onSubmit={handleBuildPlan} isLoading={isLoading} />
        </div>

        {/* Right Column: Telemetry & Results (60% width on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <Notice type="error" title="Plan Generation Issue">
              {error}
            </Notice>
          )}

          {/* Results State */}
          {plan && assessment ? (
            <div className="space-y-6 animate-fadeIn">
              {snapshot && (
                <>
                  <AqiSummary snapshot={snapshot} assessment={assessment} />
                  <ForecastStrip
                    hourly={snapshot.hourly}
                    bestWindows={assessment.bestOutdoorWindows}
                    worstWindows={assessment.worstOutdoorWindows}
                    ventilationWindow={assessment.ventilationWindow}
                  />
                  <PollutantTable pollutants={snapshot.pollutants} />
                </>
              )}

              <PlanView plan={plan} assessment={assessment} impacts={impacts} source={source} />

              <CommunityPledgeSection />

              <AskPanel profile={profile} snapshot={snapshot || undefined} />
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 bg-surface border border-dashed border-rule rounded text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-lg">
                🌬️
              </div>
              <h3 className="text-sm font-semibold text-ink">No Plan Generated Yet</h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                Enter your location and household profile on the left and click &ldquo;Build My
                Daily Smog Plan&rdquo; to receive your personalized routine, ventilation schedule,
                and impact estimates.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Application Footer */}
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
    </div>
  );
}
