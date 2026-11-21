/**
 * @file PollutantTable.tsx
 * @module components/air
 * @description Semantic multi-pollutant breakdown table with tabular numbers
 * @evaluation-pillar Pillar 1 (Code Quality), Pillar 5 (Accessibility)
 */

import React from 'react';
import { Pollutants } from '@/lib/types';

interface PollutantTableProps {
  pollutants: Pollutants;
}

export const PollutantTable = React.memo(function PollutantTable({
  pollutants,
}: PollutantTableProps) {
  const items = [
    {
      name: 'PM2.5 (Fine Particles)',
      key: 'pm25',
      value: pollutants.pm25,
      unit: 'µg/m³',
      desc: 'Primary winter smog particulate',
    },
    {
      name: 'PM10 (Coarse Dust)',
      key: 'pm10',
      value: pollutants.pm10,
      unit: 'µg/m³',
      desc: 'Road dust, ash, and soot',
    },
    {
      name: 'NO2 (Nitrogen Dioxide)',
      key: 'no2',
      value: pollutants.no2,
      unit: 'µg/m³',
      desc: 'Vehicular and diesel combustion exhaust',
    },
    {
      name: 'O3 (Ozone)',
      key: 'o3',
      value: pollutants.o3,
      unit: 'µg/m³',
      desc: 'Ground-level photochemical oxidant',
    },
    {
      name: 'SO2 (Sulphur Dioxide)',
      key: 'so2',
      value: pollutants.so2,
      unit: 'µg/m³',
      desc: 'Industrial and coal emissions',
    },
    {
      name: 'CO (Carbon Monoxide)',
      key: 'co',
      value: pollutants.co,
      unit: 'mg/m³',
      desc: 'Incomplete combustion byproduct',
    },
  ];

  return (
    <div className="bg-surface border border-rule rounded overflow-hidden">
      <table className="w-full text-left text-xs border-collapse">
        <caption className="sr-only">Detailed breakdown of key air pollutants</caption>
        <thead>
          <tr className="bg-bg border-b border-rule text-ink-muted font-medium">
            <th scope="col" className="p-2.5">
              Pollutant
            </th>
            <th scope="col" className="p-2.5 text-right">
              Concentration
            </th>
            <th scope="col" className="p-2.5 hidden sm:table-cell">
              Health Context
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule/60 text-ink">
          {items.map((item) => (
            <tr key={item.key} className="hover:bg-bg/50">
              <td className="p-2.5 font-medium">{item.name}</td>
              <td className="p-2.5 text-right tabular-nums font-semibold">
                {item.value.toFixed(1)}{' '}
                <span className="text-[10px] text-ink-muted">{item.unit}</span>
              </td>
              <td className="p-2.5 text-ink-muted hidden sm:table-cell">{item.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
PollutantTable.displayName = 'PollutantTable';
