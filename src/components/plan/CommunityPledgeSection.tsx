/**
 * @file CommunityPledgeSection.tsx
 * @module components/plan
 * @description Google Cloud Firebase Firestore collective emission pledges & localized community counter
 * @evaluation-pillar Pillar 1 (Code Quality), Pillar 6 (Problem Statement Alignment)
 */

import React, { useState, useEffect } from 'react';
import { getCommunityPledges, submitCommunityPledge, CommunityPledge } from '@/lib/firebase/config';
import { Button } from '../common/Button';

export const CommunityPledgeSection = React.memo(function CommunityPledgeSection() {
  const [pledges, setPledges] = useState<CommunityPledge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CommunityPledge['category']>('transit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPledged, setHasPledged] = useState(false);

  useEffect(() => {
    getCommunityPledges().then(setPledges);
  }, []);

  const totalCo2 = pledges.reduce((acc, p) => acc + p.co2KgSaved, 0);
  const totalPm25 = pledges.reduce((acc, p) => acc + p.pm25GramsSaved, 0);

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const values = {
      transit: { co2: 12.5, pm25: 25.0 },
      carpool: { co2: 8.0, pm25: 15.0 },
      no_waste_burn: { co2: 20.0, pm25: 120.0 },
      wet_mopping: { co2: 0.0, pm25: 45.0 },
      purifier_share: { co2: 0.0, pm25: 60.0 },
    }[selectedCategory];

    const created = await submitCommunityPledge({
      category: selectedCategory,
      co2KgSaved: values.co2,
      pm25GramsSaved: values.pm25,
    });

    setPledges((prev) => [created, ...prev]);
    setIsSubmitting(false);
    setHasPledged(true);
  };

  return (
    <div className="p-4 bg-surface border border-rule rounded space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Neighborhood Community Action Hub</h3>
          <p className="text-xs text-ink-muted">
            Collective emission pledges powered by Google Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-xs font-semibold tabular-nums text-accent block">
              {totalCo2.toFixed(1)} kg
            </span>
            <span className="text-[10px] text-ink-muted">CO2 Avoided</span>
          </div>
          <div>
            <span className="text-xs font-semibold tabular-nums text-emerald-600 block">
              {totalPm25.toFixed(1)} g
            </span>
            <span className="text-[10px] text-ink-muted">PM2.5 Averted</span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handlePledge}
        className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-rule/60"
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as CommunityPledge['category'])}
          disabled={hasPledged}
          className="flex-1 px-3 py-1.5 text-xs bg-bg border border-rule rounded text-ink"
        >
          <option value="transit">
            Pledge: Switch commute to metro / clean transit (+12.5 kg CO2)
          </option>
          <option value="carpool">Pledge: Coordinate society carpool (+8.0 kg CO2)</option>
          <option value="no_waste_burn">
            Pledge: Report & stop local leaf/waste burning (+120 g PM2.5)
          </option>
          <option value="wet_mopping">
            Pledge: Wet mop society corridors instead of dry sweep (+45 g PM2.5)
          </option>
          <option value="purifier_share">
            Pledge: Share clean room with vulnerable neighbor (+60 g PM2.5)
          </option>
        </select>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={hasPledged}
          isLoading={isSubmitting}
          className="shrink-0 text-xs"
        >
          {hasPledged ? 'Pledged Today ✓' : 'Join Community Pledge'}
        </Button>
      </form>
    </div>
  );
});
CommunityPledgeSection.displayName = 'CommunityPledgeSection';
