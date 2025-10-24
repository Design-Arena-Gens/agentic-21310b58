'use client';

import { useMemo } from 'react';
import type { CalculationRecord } from './store';
import { GLOBAL_AVERAGE_TONNES } from '../data/constants';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#38bdf8', '#22c55e', '#f97316', '#a855f7'];

interface Props {
  record: CalculationRecord;
}

export function ResultsVisualizer({ record }: Props) {
  const data = useMemo(
    () => [
      {
        label: 'Transportation',
        value: record.breakdown.transportation
      },
      {
        label: 'Energy',
        value: record.breakdown.energy
      },
      {
        label: 'Diet',
        value: record.breakdown.diet
      },
      {
        label: 'Waste',
        value: record.breakdown.waste
      }
    ],
    [record.breakdown]
  );

  const comparison = record.totalTonnes - GLOBAL_AVERAGE_TONNES;
  const comparisonLabel = comparison >= 0 ? 'above' : 'below';

  return (
    <div>
      <h3>Latest Footprint</h3>
      <div className="grid-2" style={{ alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '2.8rem', fontWeight: 700 }}>
            {record.totalTonnes.toFixed(2)} <span style={{ fontSize: '1.4rem' }}>t CO₂e</span>
          </div>
          <p className="muted">
            {Math.abs(comparison).toFixed(2)} t {comparisonLabel} the global average of {GLOBAL_AVERAGE_TONNES.toFixed(1)}
            t CO₂e/year.
          </p>
          <div className="chip-row" style={{ marginTop: 16 }}>
            <div className="badge">Transport {record.breakdown.transportation.toFixed(2)} t</div>
            <div className="badge">Energy {record.breakdown.energy.toFixed(2)} t</div>
            <div className="badge">Diet {record.breakdown.diet.toFixed(2)} t</div>
            <div className="badge">Waste {record.breakdown.waste.toFixed(2)} t</div>
          </div>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
