'use client';

import { useMemo, useState } from 'react';
import { CalculatorInputs, CalculatorState, useCalculatorStore } from './store';
import { deriveRecord, buildRecommendations } from './calculation-utils';
import { GLOBAL_AVERAGE_TONNES } from '../data/constants';
import { ResultsVisualizer } from './ResultsVisualizer';
import { Recommendations } from './Recommendations';

type FormState = CalculatorInputs;

const defaultState: FormState = {
  carKilometres: 12000,
  airTravelHours: 18,
  publicTransitKilometres: 1500,
  electricityKwh: 240,
  dietProfile: 'mediumMeat',
  wasteKg: 35,
  recycleRate: 45,
  compostRate: 10
};

export function CarbonCalculator() {
  const [formState, setFormState] = useState<FormState>(defaultState);
  const [activeRecordId, setActiveRecordId] = useState<string | undefined>();
  const addCalculation = useCalculatorStore((state) => state.addCalculation);
  const history = useCalculatorStore((state) => state.history);
  const latest = useCalculatorStore((state) => state.latest);

  const activeRecord = useMemo(() => {
    if (activeRecordId) {
      return history.find((item) => item.id === activeRecordId) ?? latest;
    }
    return latest;
  }, [activeRecordId, history, latest]);

  const submit = () => {
    const record = deriveRecord(formState);
    addCalculation(record);
    setActiveRecordId(record.id);
  };

  const recommendations = useMemo(() => {
    if (!activeRecord) return [];
    return buildRecommendations(formState, activeRecord.breakdown);
  }, [activeRecord, formState]);

  return (
    <section id="calculator" className="card">
      <div className="section-header">
        <div>
          <h2>Carbon Footprint Calculator</h2>
          <p className="muted">
            Track emissions across transportation, energy, diet, and waste streams. Benchmark
            progress against the global average of {GLOBAL_AVERAGE_TONNES.toFixed(1)} t CO₂e/year.
          </p>
        </div>
        <button className="button" onClick={submit} type="button">
          Run Calculation
        </button>
      </div>

      <div className="separator" />

      <div className="grid-2">
        <form className="card" style={{ margin: 0, background: 'rgba(15, 23, 42, 0.85)' }}>
          <h3>Inputs</h3>
          <label htmlFor="car">Car travel • kilometres / year</label>
          <input
            id="car"
            type="number"
            min={0}
            value={formState.carKilometres}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              carKilometres: Number(event.target.value)
            }))}
          />

          <label htmlFor="air">Air travel • hours / year</label>
          <input
            id="air"
            type="number"
            min={0}
            value={formState.airTravelHours}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              airTravelHours: Number(event.target.value)
            }))}
          />

          <label htmlFor="transit">Public transit • kilometres / year</label>
          <input
            id="transit"
            type="number"
            min={0}
            value={formState.publicTransitKilometres}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              publicTransitKilometres: Number(event.target.value)
            }))}
          />

          <label htmlFor="energy">Electricity usage • kWh / month</label>
          <input
            id="energy"
            type="number"
            min={0}
            value={formState.electricityKwh}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              electricityKwh: Number(event.target.value)
            }))}
          />

          <label htmlFor="diet">Diet profile</label>
          <select
            id="diet"
            value={formState.dietProfile}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              dietProfile: event.target.value as FormState['dietProfile']
            }))}
          >
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="lightMeat">Light Meat</option>
            <option value="mediumMeat">Medium Meat</option>
            <option value="heavyMeat">Heavy Meat</option>
          </select>

          <label htmlFor="waste">Waste generation • kg / month</label>
          <input
            id="waste"
            type="number"
            min={0}
            value={formState.wasteKg}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              wasteKg: Number(event.target.value)
            }))}
          />

          <label htmlFor="recycle">Recycling rate %</label>
          <input
            id="recycle"
            type="number"
            min={0}
            max={100}
            value={formState.recycleRate}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              recycleRate: Number(event.target.value)
            }))}
          />

          <label htmlFor="compost">Composting rate %</label>
          <input
            id="compost"
            type="number"
            min={0}
            max={100}
            value={formState.compostRate}
            onChange={(event) => setFormState((prev) => ({
              ...prev,
              compostRate: Number(event.target.value)
            }))}
          />
        </form>

        <div className="card" style={{ margin: 0, background: 'rgba(15, 23, 42, 0.85)' }}>
          {activeRecord ? (
            <ResultsVisualizer record={activeRecord} />
          ) : (
            <div>
              <h3>Awaiting calculation</h3>
              <p className="muted">
                Input your lifestyle data, run the calculation, and discover a detailed emissions
                profile complete with personalised reduction levers.
              </p>
            </div>
          )}
        </div>
      </div>

      {activeRecord && (
        <div className="grid-2" style={{ marginTop: 32 }}>
          <Recommendations items={recommendations} />
          <HistoryPreview
            history={history}
            activeRecordId={activeRecordId}
            onSelect={(id) => setActiveRecordId(id)}
          />
        </div>
      )}
    </section>
  );
}

interface HistoryPreviewProps {
  history: CalculatorState['history'];
  activeRecordId?: string;
  onSelect: (id: string) => void;
}

function HistoryPreview({ history, activeRecordId, onSelect }: HistoryPreviewProps) {
  if (!history.length) {
    return (
      <div className="card" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
        <h3>Calculation History</h3>
        <p className="muted">Run your first calculation to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
      <h3>Calculation History</h3>
      <div className="list">
        {history.slice(0, 5).map((record) => (
          <button
            key={record.id}
            onClick={() => onSelect(record.id)}
            type="button"
            style={{
              textAlign: 'left',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 12,
              padding: 12,
              background: record.id === activeRecordId ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
              color: 'inherit'
            }}
          >
            <strong>{new Date(record.timestamp).toLocaleString()}</strong>
            <div className="muted">{record.totalTonnes.toFixed(2)} t CO₂e</div>
          </button>
        ))}
      </div>
    </div>
  );
}
