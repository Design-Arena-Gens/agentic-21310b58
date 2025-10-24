'use client';

import { useState } from 'react';
import { useCalculatorStore } from './store';

export function CalculationHistory() {
  const history = useCalculatorStore((state) => state.history);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!history.length) {
    return (
      <section id="history" className="card">
        <h2>Calculation History</h2>
        <p className="muted">
          Footprint calculations will surface here with full input and category breakdowns. Run
          multiple scenarios to unlock longitudinal insights.
        </p>
      </section>
    );
  }

  return (
    <section id="history" className="card">
      <h2>Calculation History</h2>
      <p className="muted">
        Every run is preserved locally so you can compare seasonal changes, lifestyle shifts, and
        the corresponding impact on your annual emissions.
      </p>

      <div className="separator" />

      <div className="list">
        {history.map((record) => {
          const expanded = expandedId === record.id;
          return (
            <article
              key={record.id}
              className="card"
              style={{
                background: expanded ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.2)'
              }}
            >
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{new Date(record.timestamp).toLocaleString()}</strong>
                  <div className="muted">Total footprint: {record.totalTonnes.toFixed(2)} t CO₂e</div>
                </div>
                <button
                  className="button"
                  style={{ background: 'linear-gradient(120deg, #38bdf8, #0ea5e9)', color: '#0f172a' }}
                  onClick={() => setExpandedId(expanded ? null : record.id)}
                  type="button"
                >
                  {expanded ? 'Collapse' : 'Expand'}
                </button>
              </header>

              {expanded && (
                <div style={{ marginTop: 16 }}>
                  <div className="grid-2">
                    <div>
                      <h4>Transportation</h4>
                      <p className="muted">
                        Car: {record.inputs.carKilometres.toLocaleString()} km · Air travel:{' '}
                        {record.inputs.airTravelHours} h · Transit:{' '}
                        {record.inputs.publicTransitKilometres.toLocaleString()} km
                      </p>
                      <h4>Energy</h4>
                      <p className="muted">Electricity: {record.inputs.electricityKwh} kWh/month</p>
                    </div>
                    <div>
                      <h4>Diet & Waste</h4>
                      <p className="muted">Diet profile: {formatDiet(record.inputs.dietProfile)}</p>
                      <p className="muted">
                        Waste: {record.inputs.wasteKg} kg/month · Recycling {record.inputs.recycleRate}% ·
                        Compost {record.inputs.compostRate}%
                      </p>
                    </div>
                  </div>

                  <div className="chip-row" style={{ marginTop: 16 }}>
                    <div className="badge">Transport {record.breakdown.transportation.toFixed(2)} t</div>
                    <div className="badge">Energy {record.breakdown.energy.toFixed(2)} t</div>
                    <div className="badge">Diet {record.breakdown.diet.toFixed(2)} t</div>
                    <div className="badge">Waste {record.breakdown.waste.toFixed(2)} t</div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatDiet(key: string) {
  switch (key) {
    case 'vegan':
      return 'Vegan';
    case 'vegetarian':
      return 'Vegetarian';
    case 'lightMeat':
      return 'Light Meat';
    case 'mediumMeat':
      return 'Medium Meat';
    case 'heavyMeat':
      return 'Heavy Meat';
    default:
      return key;
  }
}
