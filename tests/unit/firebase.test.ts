import { describe, it, expect } from 'vitest';
import { getCommunityPledges, submitCommunityPledge } from '@/lib/firebase/config';

describe('Firebase & Local Fallback Store', () => {
  it('retrieves default seed community pledges', async () => {
    const pledges = await getCommunityPledges();
    expect(pledges.length).toBeGreaterThanOrEqual(2);
    expect(pledges[0]?.category).toBe('transit');
  });

  it('submits a new community pledge and prepends to the list', async () => {
    const newPledge = await submitCommunityPledge({
      category: 'carpool',
      co2KgSaved: 22.5,
      pm25GramsSaved: 50.0,
    });

    expect(newPledge.id).toBeDefined();
    expect(newPledge.category).toBe('carpool');
    expect(newPledge.co2KgSaved).toBe(22.5);

    const updated = await getCommunityPledges();
    expect(updated[0]?.id).toBe(newPledge.id);
  });
});
