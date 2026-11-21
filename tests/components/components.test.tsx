import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AqiSummary } from '@/components/air/AqiSummary';
import { ForecastStrip } from '@/components/air/ForecastStrip';
import { PlanView } from '@/components/plan/PlanView';
import { GOLDEN_SCENARIOS } from '../fixtures/scenarios';
import { assessHouseholdRisk } from '@/lib/aqi/risk';
import { buildImpactEstimates } from '@/lib/impact/summary';
import { buildFallbackPlan } from '@/lib/ai/fallback';

describe('UI Component Rendering & Interaction Suite', () => {
  const baseScenario = GOLDEN_SCENARIOS[0]!;
  const assessment = assessHouseholdRisk(baseScenario.profile, baseScenario.snapshot);
  const impacts = buildImpactEstimates(baseScenario.profile, assessment);
  const plan = buildFallbackPlan(baseScenario.profile, assessment, impacts, 'en');

  describe('ProfileForm', () => {
    it('renders form with location, steppers, and submit button', () => {
      const mockSubmit = vi.fn();
      render(
        <ProfileForm
          initialProfile={baseScenario.profile}
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      expect(screen.getByText(/Your Location/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Build My Daily Smog Plan/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Increase adults/i)).toBeInTheDocument();
    });

    it('increments adult count when plus button is clicked', async () => {
      const user = userEvent.setup();
      const mockSubmit = vi.fn();
      render(
        <ProfileForm
          initialProfile={baseScenario.profile}
          onSubmit={mockSubmit}
          isLoading={false}
        />
      );

      const plusBtn = screen.getByLabelText(/Increase adults/i);
      await user.click(plusBtn);

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('AqiSummary', () => {
    it('renders AQI number, category badge, and geometric glyph', () => {
      render(<AqiSummary snapshot={baseScenario.snapshot} assessment={assessment} />);

      expect(screen.getByText(String(baseScenario.snapshot.aqi))).toBeInTheDocument();
      expect(screen.getByText(assessment.tier)).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /Current Air Quality Summary/i })).toBeInTheDocument();
    });
  });

  describe('ForecastStrip', () => {
    it('renders hourly forecast with sr-only twin structured list', () => {
      render(
        <ForecastStrip
          hourly={baseScenario.snapshot.hourly}
          bestWindows={assessment.bestOutdoorWindows}
          worstWindows={assessment.worstOutdoorWindows}
        />
      );

      // Assert screen-reader twin exists
      const srList = screen.getByRole('list', { name: /Hourly air quality forecast description/i });
      expect(srList).toBeInTheDocument();
      expect(srList).toHaveClass('sr-only');
    });
  });

  describe('PlanView', () => {
    it('renders all three action categories and copy button', () => {
      render(
        <PlanView
          plan={plan}
          assessment={assessment}
          impacts={impacts}
          source="fallback"
        />
      );

      expect(screen.getByText(/1. Low-Emission Daily Routine/i)).toBeInTheDocument();
      expect(screen.getByText(/2. Indoor Air Quality \(IAQ\) Hacks/i)).toBeInTheDocument();
      expect(screen.getByText(/3. Sustainable Clean Alternatives/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
    });
  });
});
