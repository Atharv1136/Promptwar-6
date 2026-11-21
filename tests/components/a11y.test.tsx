import { describe, it, expect } from 'vitest';
import 'vitest-axe/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { AqiSummary } from '@/components/air/AqiSummary';
import { PollutantTable } from '@/components/air/PollutantTable';
import { ForecastStrip } from '@/components/air/ForecastStrip';
import { PlanView } from '@/components/plan/PlanView';
import { GOLDEN_SCENARIOS } from '../fixtures/scenarios';
import { assessHouseholdRisk } from '@/lib/aqi/risk';
import { buildImpactEstimates } from '@/lib/impact/summary';
import { buildFallbackPlan } from '@/lib/ai/fallback';

describe('WCAG 2.2 AA Accessibility Audit Suite (vitest-axe)', () => {
  const scenario = GOLDEN_SCENARIOS[0]!;
  const assessment = assessHouseholdRisk(scenario.profile, scenario.snapshot);
  const impacts = buildImpactEstimates(scenario.profile, assessment);
  const plan = buildFallbackPlan(scenario.profile, assessment, impacts, 'en');

  it('AqiSummary passes axe accessibility validation with 0 violations', async () => {
    const { container } = render(
      <AqiSummary snapshot={scenario.snapshot} assessment={assessment} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('PollutantTable passes axe accessibility validation with 0 violations', async () => {
    const { container } = render(
      <PollutantTable pollutants={scenario.snapshot.pollutants} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ForecastStrip with twin representation passes axe accessibility with 0 violations', async () => {
    const { container } = render(
      <ForecastStrip
        hourly={scenario.snapshot.hourly}
        bestWindows={assessment.bestOutdoorWindows}
        worstWindows={assessment.worstOutdoorWindows}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('PlanView passes axe accessibility validation with 0 violations', async () => {
    const { container } = render(
      <PlanView
        plan={plan}
        assessment={assessment}
        impacts={impacts}
        source="fallback"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
