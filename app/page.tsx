import { CarbonCalculator } from './components/CarbonCalculator';
import { VehicleScanner } from './components/VehicleScanner';
import { AirQualityMonitor } from './components/AirQualityMonitor';
import { IndiaEmissionsMap } from './components/IndiaEmissionsMap';
import { CalculationHistory } from './components/CalculationHistory';
import { ProgressTracker } from './components/ProgressTracker';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.18)', color: '#4ade80' }}>
          EcoTrack Intelligence Suite
        </span>
        <h1>Monitor, Model, and Minimise Your Carbon Footprint</h1>
        <p>
          EcoTrack brings together high-resolution footprint analytics, vehicle emissions scanning,
          live air quality intelligence, and India-wide benchmarking to help you stay on track for a
          low-carbon future.
        </p>
      </section>

      <CarbonCalculator />
      <ProgressTracker />
      <VehicleScanner />
      <AirQualityMonitor />
      <IndiaEmissionsMap />
      <CalculationHistory />
    </main>
  );
}
