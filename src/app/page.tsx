// ============================================================
// src/app/page.tsx
// Main Application Page (Saans — Winter Smog Companion)
// Decomposed layout, reactive states, and WCAG 2.2 AA accessibility
// ============================================================

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Profile, AirSnapshot, Plan, RiskAssessment, ImpactEstimate } from '@/lib/types';
import { DEFAULT_PROFILE } from '@/lib/constants/defaultProfile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AqiSummary } from '@/components/air/AqiSummary';
import { PollutantTable } from '@/components/air/PollutantTable';
import { ForecastStrip } from '@/components/air/ForecastStrip';
import { PlanView } from '@/components/plan/PlanView';
import { EmptyPlanState } from '@/components/plan/EmptyPlanState';
import { CommunityPledgeSection } from '@/components/plan/CommunityPledgeSection';
import { AppFooter } from '@/components/layout/AppFooter';
import { Notice } from '@/components/common/Notice';

const AskPanel = dynamic(() => import('@/components/chat/AskPanel').then((mod) => mod.AskPanel), {
  ssr: false,
});

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

      if (manualAqi === undefined) {
        const { lat, lon } = submittedProfile.location;
        const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (!data.ok)
          throw new Error(data.error?.message || 'Failed to fetch air quality telemetry');
        resolvedSnapshot = data.data;
        if (resolvedSnapshot) setSnapshot(resolvedSnapshot);
      }

      const planRes = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: submittedProfile,
          snapshot: resolvedSnapshot,
          manualAqi,
        }),
      });

      const planData = await planRes.json();
      if (!planData.ok)
        throw new Error(planData.error?.message || 'Failed to generate action plan');

      setPlan(planData.data.plan);
      setAssessment(planData.data.assessment);
      setImpacts(planData.data.impacts);
      setSource(planData.data.source);
      if (planData.data.snapshot) setSnapshot(planData.data.snapshot);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      <header className="space-y-2 border-b border-rule pb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            🫁
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Saans{' '}
            <span className="font-normal text-ink-muted text-lg sm:text-xl">
              — Winter Smog Companion
            </span>
          </h1>
        </div>
        <p className="text-sm text-ink-muted max-w-2xl leading-relaxed">
          Actionable, household-tailored daily routines, ventilation forecasts, and exposure
          reductions for Indian urban air pollution.
        </p>
      </header>

      {error && <Notice type="error">{error}</Notice>}

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-lg font-semibold text-ink">Household Profile & Preferences</h2>
          <ProfileForm initialProfile={profile} onSubmit={handleBuildPlan} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-lg font-semibold text-ink sr-only">
            Air Quality & Personalized Smog Plan
          </h2>

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
            <EmptyPlanState />
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
