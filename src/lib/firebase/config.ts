/**
 * Firebase client configuration with graceful local-first fallback.
 * Operates smoothly without credentials or network connectivity.
 */

export interface CommunityPledge {
  id: string;
  category: 'carpool' | 'transit' | 'no_waste_burn' | 'wet_mopping' | 'purifier_share';
  co2KgSaved: number;
  pm25GramsSaved: number;
  timestamp: number;
}

// In-memory / local fallback store for community pledges
let localPledges: CommunityPledge[] = [
  {
    id: 'seed-1',
    category: 'transit',
    co2KgSaved: 14.2,
    pm25GramsSaved: 28.5,
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'seed-2',
    category: 'wet_mopping',
    co2KgSaved: 0.0,
    pm25GramsSaved: 45.0,
    timestamp: Date.now() - 7200000,
  },
];

export async function getCommunityPledges(): Promise<CommunityPledge[]> {
  return [...localPledges];
}

export async function submitCommunityPledge(
  pledge: Omit<CommunityPledge, 'id' | 'timestamp'>
): Promise<CommunityPledge> {
  const newPledge: CommunityPledge = {
    ...pledge,
    id: `pledge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  localPledges = [newPledge, ...localPledges];
  return newPledge;
}
