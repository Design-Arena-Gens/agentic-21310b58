'use client';

import { useMemo } from 'react';
import { GLOBAL_AVERAGE_TONNES } from '../data/constants';
import { useCalculatorStore, CalculatorState } from './store';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export function ProgressTracker() {
  const history = useCalculatorStore((state) => state.history);
  const canRender = history.length >= 2;
  const series = useMemo(() => buildSeries(history), [history]);

  if (!canRender) {
    return (
      <section id="progress" className="card">
        <h2>Progress Tracking</h2>
        <p className="muted">
          Complete at least two calculations to unlock trend visualisations, Paris-aligned
          trajectories, and milestone tracking.
        </p>
      </section>
    );
  }

  const first = series[0];
  const latest = series[series.length - 1];
  const delta = ((latest.total - first.total) / first.total) * 100;
  const parisGap = ((latest.total - 2) / 2) * 100;

  return (
    <section id="progress" className="card">
      <h2>Progress Tracking</h2>
      <p className="muted">
        Visualise the evolution of your footprint across sectors and benchmark against a Paris-aligned
        2.0 t CO₂e/year trajectory.
      </p>

      <div className="separator" />

      <div className="grid-3">
        <div className="stat-card">
          <span className="muted">Total Change</span>
          <strong>{delta > 0 ? '+' : ''}{delta.toFixed(1)}%</strong>
          <small className="muted">Since first benchmark</small>
        </div>
        <div className="stat-card">
          <span className="muted">Current Footprint</span>
          <strong>{latest.total.toFixed(2)} t</strong>
          <small className="muted">Latest calculation</small>
        </div>
        <div className="stat-card">
          <span className="muted">Paris Goal Gap</span>
          <strong>{parisGap > 0 ? '+' : ''}{parisGap.toFixed(1)}%</strong>
          <small className="muted">Against 2.0 t CO₂e target</small>
        </div>
      </div>

      <div style={{ width: '100%', height: 320, marginTop: 24 }}>
        <ResponsiveContainer>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="label" stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
            <YAxis stroke="#94a3b8" domain={[0, 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
            <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2.2} />
            <Line type="monotone" dataKey="transportation" stroke="#38bdf8" strokeWidth={1.8} />
            <Line type="monotone" dataKey="energy" stroke="#facc15" strokeWidth={1.8} />
            <Line type="monotone" dataKey="diet" stroke="#f97316" strokeWidth={1.8} />
            <Line type="monotone" dataKey="waste" stroke="#a855f7" strokeWidth={1.8} />
            <Line
              type="monotone"
              dataKey="parisPath"
              stroke="#e11d48"
              strokeWidth={1.6}
              strokeDasharray="6 4"
            />
            <Line
              type="monotone"
              dataKey="globalAverage"
              stroke="#64748b"
              strokeWidth={1.4}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function buildSeries(history: CalculatorState['history']) {
  const chronological = [...history].reverse();
  return chronological.map((record, index) => ({
    label: new Date(record.timestamp).toLocaleDateString(),
    total: Number(record.totalTonnes.toFixed(2)),
    transportation: Number(record.breakdown.transportation.toFixed(2)),
    energy: Number(record.breakdown.energy.toFixed(2)),
    diet: Number(record.breakdown.diet.toFixed(2)),
    waste: Number(record.breakdown.waste.toFixed(2)),
    parisPath: Math.max(2, 4.5 - index * 0.3),
    globalAverage: GLOBAL_AVERAGE_TONNES
  }));
}
