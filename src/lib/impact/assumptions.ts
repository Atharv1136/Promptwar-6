// ============================================================
// src/lib/impact/assumptions.ts
// Documented scientific constants, peer-reviewed baselines, and stated assumptions
// Per PRD.md §7 (FR4) and ARCHITECTURE.md §3
// ============================================================

export interface ImpactAssumption {
  id: string;
  name: string;
  description: string;
  sourceNote: string;
  isApproximate: boolean;
}

export const ASSUMPTIONS: Record<string, ImpactAssumption> = {
  'asm-indoor-sealed': {
    id: 'asm-indoor-sealed',
    name: 'Sealed Home Infiltration Factor',
    description:
      'Well-sealed urban residential apartments with closed windows typically maintain an indoor/outdoor PM2.5 ratio of 0.35–0.50 during winter inversions.',
    sourceNote:
      'EPA Indoor Air Quality Research & Lawrence Berkeley National Lab (LBNL) Infiltration Models.',
    isApproximate: false,
  },
  'asm-indoor-leaky': {
    id: 'asm-indoor-leaky',
    name: 'Leaky Home Infiltration Factor',
    description:
      'Homes with average or leaky window frames allow significant ambient smog infiltration, exhibiting an indoor/outdoor PM2.5 ratio of 0.70–0.85.',
    sourceNote: 'Building Infiltration Studies & Urban Stagnation Measurement Campaigns.',
    isApproximate: false,
  },
  'asm-hepa-cadr': {
    id: 'asm-hepa-cadr',
    name: 'HEPA Purifier Clean Air Delivery',
    description:
      'A true HEPA filter operates at 99.97% single-pass efficiency at 0.3 microns, achieving 70%–90% room-level steady-state PM2.5 reduction when appropriately sized.',
    sourceNote: 'AHAM AC-1 CADR Standard & ASHRAE 52.2.',
    isApproximate: false,
  },
  'asm-diy-boxfan': {
    id: 'asm-diy-boxfan',
    name: 'Corsi-Rosenthal Box / DIY Filter',
    description:
      'A certified box fan equipped with MERV 13 filtration media delivers an estimated 60%–75% reduction in room particulate concentration.',
    sourceNote:
      'EPA DIY Air Cleaners Evaluation & UC Davis Air Quality Testing (approximate / illustrative).',
    isApproximate: true,
  },
  'asm-n95-respirator': {
    id: 'asm-n95-respirator',
    name: 'N95 / FFP2 Respirator Protection',
    description:
      'A properly fitted N95 or FFP2 respirator reduces inhaled particulate matter by 85%–95%. Cloth and surgical masks do not provide an airtight seal against fine PM2.5.',
    sourceNote: 'NIOSH NPPTL Respirator Infiltration Standards & CDC Guidance.',
    isApproximate: false,
  },
  'asm-commute-car-transit': {
    id: 'asm-commute-car-transit',
    name: 'Car to Transit Emission Factor',
    description:
      'Shifting from a single-occupancy gasoline passenger vehicle to electrified rapid transit or clean bus transit avoids approximately 0.14–0.18 kg CO2e per passenger-km.',
    sourceNote:
      'IPCC Working Group III Transport Emissions & EPA Emission Factors for GHG Inventories.',
    isApproximate: false,
  },
  'asm-commute-two-wheeler': {
    id: 'asm-commute-two-wheeler',
    name: 'Two-Wheeler to Transit Factor',
    description:
      'Switching daily commutes from petrol two-wheelers to public transit or carpooling avoids approximately 0.04–0.06 kg CO2e per km.',
    sourceNote: 'CPCB / ARAI Indian Urban Transport Emission Factors.',
    isApproximate: false,
  },
  'asm-cooking-clean-fuel': {
    id: 'asm-cooking-clean-fuel',
    name: 'Clean Cooking Fuel Displacement',
    description:
      'Displacing traditional biomass / solid-fuel cooking stoves with LPG/PNG or induction eliminates severe indoor smoke and avoids an estimated 15–25 kg CO2e weekly.',
    sourceNote: 'WHO Guidelines for Indoor Air Quality: Household Fuel Combustion.',
    isApproximate: false,
  },
  'asm-community-multiplier': {
    id: 'asm-community-multiplier',
    name: 'Neighborhood Community Multiplier',
    description:
      'Linear illustrative scaling assuming 50 households in a housing society or neighborhood block adopt collective anti-smog pledges.',
    sourceNote: 'Illustrative neighborhood aggregation multiplier.',
    isApproximate: true,
  },
};
