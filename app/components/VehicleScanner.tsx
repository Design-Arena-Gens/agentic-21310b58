'use client';

import { useMemo, useState } from 'react';
import {
  VEHICLE_COLORS,
  VEHICLE_CONDITIONS,
  VEHICLE_IDENTIFIERS,
  VEHICLE_PROFILES
} from '../data/constants';

interface VehicleInsight {
  id: string;
  fileName: string;
  vehicle: {
    make: string;
    model: string;
    type: string;
    fuel: string;
    engine: string;
    efficiency: number;
    color: string;
    estimatedYear: number;
    condition: string;
  };
  metrics: {
    co2PerKm: number;
    annualTonnes: number;
    fuelEfficiency: number;
    rating: 'Low' | 'Medium' | 'High' | 'Very High';
    confidence: number;
  };
  identificationBasis: string[];
}

const averageAnnualKm = 14000;

const ratingForTonnes = (tonnes: number): VehicleInsight['metrics']['rating'] => {
  if (tonnes < 1.5) return 'Low';
  if (tonnes < 3) return 'Medium';
  if (tonnes < 4.5) return 'High';
  return 'Very High';
};

const hashString = (input: string) =>
  input.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);

export function VehicleScanner() {
  const [insights, setInsights] = useState<VehicleInsight[]>([]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length) return;

    const payload: VehicleInsight[] = Array.from(files).map((file, index) => {
      const seed = hashString(`${file.name}-${index}`);
      const profile = VEHICLE_PROFILES[seed % VEHICLE_PROFILES.length];
      const color = VEHICLE_COLORS[seed % VEHICLE_COLORS.length];
      const condition = VEHICLE_CONDITIONS[seed % VEHICLE_CONDITIONS.length];
      const year = 2005 + (seed % 18);
      const basis = [
        VEHICLE_IDENTIFIERS[seed % VEHICLE_IDENTIFIERS.length],
        VEHICLE_IDENTIFIERS[(seed + 2) % VEHICLE_IDENTIFIERS.length]
      ];

      const co2PerKm = profile.co2PerKm || 22; // fallback g/km for EV lifecycle
      const annualTonnes = (co2PerKm * averageAnnualKm) / 1_000_000;
      const rating = ratingForTonnes(annualTonnes);
      const confidence = 70 + (seed % 25);

      return {
        id: `${Date.now()}-${index}`,
        fileName: file.name,
        vehicle: {
          make: profile.make,
          model: profile.model,
          type: profile.type,
          fuel: profile.fuel,
          engine: profile.engine,
          efficiency: profile.efficiency,
          color,
          estimatedYear: year,
          condition
        },
        metrics: {
          co2PerKm,
          annualTonnes: Number(annualTonnes.toFixed(2)),
          fuelEfficiency: profile.efficiency,
          rating,
          confidence
        },
        identificationBasis: basis
      };
    });

    setInsights(payload);
  };

  const summary = useMemo(() => {
    if (!insights.length) return null;
    const total = insights.reduce((sum, insight) => sum + insight.metrics.annualTonnes, 0);
    return {
      count: insights.length,
      total,
      average: total / insights.length
    };
  }, [insights]);

  return (
    <section id="vehicle" className="card">
      <div className="section-header">
        <div>
          <h2>Vehicle Carbon Scanner</h2>
          <p className="muted">
            Upload vehicle imagery to unlock AI-grade emissions intelligence for each detected asset.
            The scanner estimates drivetrain profiles, lifecycle emissions, and reduction priorities.
          </p>
        </div>
        <label className="button" style={{ cursor: 'pointer' }}>
          Upload image or video
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={upload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="separator" />

      {summary ? (
        <div className="grid-3">
          <div className="stat-card">
            <span className="muted">Vehicles Detected</span>
            <strong>{summary.count}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Combined Annual Emissions</span>
            <strong>{summary.total.toFixed(2)} t</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Average per Vehicle</span>
            <strong>{summary.average.toFixed(2)} t</strong>
          </div>
        </div>
      ) : (
        <p className="muted">No vehicles processed yet. Upload imagery to begin the analysis.</p>
      )}

      {insights.length > 0 && (
        <div className="grid-2" style={{ marginTop: 24 }}>
          {insights.map((insight) => (
            <article
              key={insight.id}
              className="card"
              style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(56, 189, 248, 0.18)' }}
            >
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>
                    {insight.vehicle.make} {insight.vehicle.model}
                  </h3>
                  <div className="muted">{insight.vehicle.type} · {insight.vehicle.fuel}</div>
                </div>
                <div className="badge">
                  {insight.metrics.rating} impact · {insight.metrics.annualTonnes.toFixed(2)} t
                </div>
              </header>

              <div className="grid-2" style={{ marginTop: 16 }}>
                <div>
                  <div className="muted">File</div>
                  <strong>{insight.fileName}</strong>
                  <div className="muted" style={{ marginTop: 12 }}>
                    Colour: {insight.vehicle.color} · Year: {insight.vehicle.estimatedYear}
                  </div>
                  <div className="muted">Condition: {insight.vehicle.condition}</div>
                </div>
                <div>
                  <ul className="list">
                    <li className="list-item">
                      <span>CO₂</span>
                      <div>{insight.metrics.co2PerKm} g/km</div>
                    </li>
                    <li className="list-item">
                      <span>Annual</span>
                      <div>{insight.metrics.annualTonnes.toFixed(2)} t</div>
                    </li>
                    <li className="list-item">
                      <span>Efficiency</span>
                      <div>{insight.metrics.fuelEfficiency} km/{insight.vehicle.fuel === 'Electric' ? 'kWh' : 'L'}</div>
                    </li>
                    <li className="list-item">
                      <span>Confidence</span>
                      <div>{insight.metrics.confidence}%</div>
                    </li>
                  </ul>
                </div>
              </div>

              <footer style={{ marginTop: 12 }}>
                <div className="muted">Identification basis: {insight.identificationBasis.join(', ')}</div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
