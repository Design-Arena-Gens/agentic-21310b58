'use client';

import { useEffect, useMemo, useState } from 'react';
import { AQI_BANDS } from '../data/constants';

interface AirQualityPayload {
  aqi: number;
  timestamp: string;
  location?: string;
  pollutants: {
    pm2_5: number;
    pm10: number;
    ozone: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    carbon_monoxide: number;
  };
  dominant: string;
}

const getBand = (aqi: number) => AQI_BANDS.find((band) => aqi <= band.max) ?? AQI_BANDS[0];

export function AirQualityMonitor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirQualityPayload | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Location services unavailable. Enable GPS to view real-time AQI.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const baseUrl = 'https://air-quality-api.open-meteo.com/v1/air-quality';
          const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            hourly:
              'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
            timezone: 'auto'
          });
          const response = await fetch(`${baseUrl}?${params.toString()}`);
          const json = await response.json();
          const hours = json?.hourly ?? {};
          const lastIndex = hours.time?.length ? hours.time.length - 1 : 0;
          const payload: AirQualityPayload = {
            aqi: hours.us_aqi?.[lastIndex] ?? 0,
            timestamp: hours.time?.[lastIndex] ?? new Date().toISOString(),
            location: json?.timezone,
            pollutants: {
              pm2_5: hours.pm2_5?.[lastIndex] ?? 0,
              pm10: hours.pm10?.[lastIndex] ?? 0,
              ozone: hours.ozone?.[lastIndex] ?? 0,
              nitrogen_dioxide: hours.nitrogen_dioxide?.[lastIndex] ?? 0,
              sulphur_dioxide: hours.sulphur_dioxide?.[lastIndex] ?? 0,
              carbon_monoxide: hours.carbon_monoxide?.[lastIndex] ?? 0
            },
            dominant: determineDominantPollutant({
              pm2_5: hours.pm2_5?.[lastIndex] ?? 0,
              pm10: hours.pm10?.[lastIndex] ?? 0,
              ozone: hours.ozone?.[lastIndex] ?? 0,
              nitrogen_dioxide: hours.nitrogen_dioxide?.[lastIndex] ?? 0,
              sulphur_dioxide: hours.sulphur_dioxide?.[lastIndex] ?? 0,
              carbon_monoxide: hours.carbon_monoxide?.[lastIndex] ?? 0
            })
          };
          setData(payload);
        } catch (fetchError) {
          setError('Could not load AQI data. Try again shortly.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location permission denied. Grant access to display live AQI.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 12000 }
    );
  }, []);

  const advisory = useMemo(() => {
    if (!data) return '';
    if (data.aqi <= 50) return 'Air quality is ideal. Continue outdoor routines as normal.';
    if (data.aqi <= 100) return 'Moderate AQI. Sensitive groups should keep monitoring the index.';
    if (data.aqi <= 150)
      return 'Limit extended outdoor activity if you have respiratory sensitivities.';
    if (data.aqi <= 200) return 'Reduce strenuous outdoor exertion and keep inhalers accessible.';
    if (data.aqi <= 300) return 'Stay indoors with filtered air and postpone outdoor workouts.';
    return 'Air quality is hazardous. Stay inside, seal windows, and use purifiers if available.';
  }, [data]);

  const band = getBand(data?.aqi ?? 0);

  return (
    <section id="air" className="card">
      <div className="section-header">
        <div>
          <h2>Air Quality Monitor</h2>
          <p className="muted">
            Pulls live AQI from Open-Meteo using your current location with pollutant-level clarity and
            targeted health advisories.
          </p>
        </div>
      </div>

      <div className="separator" />

      {loading && <p className="muted">Detecting location and fetching live AQI…</p>}
      {error && <p className="muted" style={{ color: '#f87171' }}>{error}</p>}

      {data && !loading && !error && (
        <div>
          <div className="grid-3">
            <div className="stat-card">
              <span className="muted">Current AQI</span>
              <span className={band.className} style={{ width: 'fit-content' }}>
                {data.aqi} · {band.label}
              </span>
              <small className="muted">{new Date(data.timestamp).toLocaleString()}</small>
            </div>
            <div className="stat-card">
              <span className="muted">Location</span>
              <strong>{data.location ?? 'Detected coordinates'}</strong>
              <small className="muted">Dominant pollutant: {data.dominant}</small>
            </div>
            <div className="stat-card">
              <span className="muted">Health Advisory</span>
              <p className="muted">{advisory}</p>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Pollutant</th>
                <th>Level</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              <Row pollutant="PM2.5" value={data.pollutants.pm2_5} units="µg/m³" />
              <Row pollutant="PM10" value={data.pollutants.pm10} units="µg/m³" />
              <Row pollutant="O₃" value={data.pollutants.ozone} units="µg/m³" />
              <Row pollutant="NO₂" value={data.pollutants.nitrogen_dioxide} units="µg/m³" />
              <Row pollutant="SO₂" value={data.pollutants.sulphur_dioxide} units="µg/m³" />
              <Row pollutant="CO" value={data.pollutants.carbon_monoxide} units="mg/m³" />
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function determineDominantPollutant(pollutants: AirQualityPayload['pollutants']) {
  const entries = Object.entries(pollutants);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  if (!top) return 'PM2.5';
  const labelMap: Record<string, string> = {
    pm2_5: 'PM2.5',
    pm10: 'PM10',
    ozone: 'O₃',
    nitrogen_dioxide: 'NO₂',
    sulphur_dioxide: 'SO₂',
    carbon_monoxide: 'CO'
  };
  return labelMap[top[0]] ?? top[0];
}

interface RowProps {
  pollutant: string;
  value: number;
  units: string;
}

function Row({ pollutant, value, units }: RowProps) {
  return (
    <tr>
      <td>{pollutant}</td>
      <td>{value.toFixed(2)}</td>
      <td>{units}</td>
    </tr>
  );
}
