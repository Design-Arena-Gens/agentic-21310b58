'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { CityEmission } from '../data/india-cities';
import { INDIA_CITY_EMISSIONS } from '../data/india-cities';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  async () => (await import('react-leaflet')).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false });
const CircleMarker = dynamic(async () => (await import('react-leaflet')).CircleMarker, { ssr: false });
const Popup = dynamic(async () => (await import('react-leaflet')).Popup, { ssr: false });

const colorScale = (value: number) => {
  if (value < 5) return '#22c55e';
  if (value < 15) return '#facc15';
  if (value < 30) return '#f97316';
  return '#ef4444';
};

export function IndiaEmissionsMap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import('leaflet');
      if (cancelled) return;
      const iconDefault = L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string };
      delete iconDefault._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => buildStats(INDIA_CITY_EMISSIONS), []);

  return (
    <section id="map" className="card">
      <div className="section-header">
        <div>
          <h2>India Emissions Intelligence Map</h2>
          <p className="muted">
            Visualise CO₂ loads across 25+ Indian cities. Marker scale reflects total megatonnes
            while colour highlights relative intensity.
          </p>
        </div>
      </div>

      <div className="separator" />

      {!ready ? (
        <p className="muted">Loading interactive map…</p>
      ) : (
        <MapContainer center={[22.5937, 78.9629]} zoom={5} scrollWheelZoom={false} style={{ height: 500 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {INDIA_CITY_EMISSIONS.map((city) => (
            <CircleMarker
              key={city.name}
              center={city.coordinates as [number, number]}
              radius={Math.max(8, city.totalEmissionsMt / 2)}
              pathOptions={{ color: colorScale(city.totalEmissionsMt), fillOpacity: 0.6 }}
            >
              <Popup>
                <strong>{city.name}, {city.state}</strong>
                <div>Total emissions: {city.totalEmissionsMt.toFixed(1)} Mt</div>
                <div>Per capita: {city.perCapitaTonnes.toFixed(2)} t</div>
                <div>Population: {(city.population / 1_000_000).toFixed(2)} M</div>
                <div>Top sources: {city.mainSources.join(', ')}</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      )}

      <div className="grid-3" style={{ marginTop: 24 }}>
        <div className="stat-card">
          <span className="muted">Cities Tracked</span>
          <strong>{stats.cityCount}</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Combined Emissions</span>
          <strong>{stats.totalEmissions.toFixed(1)} Mt</strong>
        </div>
        <div className="stat-card">
          <span className="muted">Average Per Capita</span>
          <strong>{stats.averagePerCapita.toFixed(2)} t</strong>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
          <h3>Top 10 Emitters</h3>
          <ol style={{ paddingLeft: 20 }}>
            {stats.topCities.map((city) => (
              <li key={city.name} style={{ marginBottom: 6 }}>
                {city.name} · {city.totalEmissionsMt.toFixed(1)} Mt
              </li>
            ))}
          </ol>
        </div>
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
          <h3>Regional Snapshot</h3>
          <ul className="list">
            {stats.regional.map((region) => (
              <li key={region.region} className="list-item">
                <span>{region.region}</span>
                <div>
                  {region.total.toFixed(1)} Mt · {region.perCapita.toFixed(2)} t per capita
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function buildStats(cities: CityEmission[]) {
  const totalEmissions = cities.reduce((sum, city) => sum + city.totalEmissionsMt, 0);
  const totalPopulation = cities.reduce((sum, city) => sum + city.population, 0);
  const topCities = [...cities]
    .sort((a, b) => b.totalEmissionsMt - a.totalEmissionsMt)
    .slice(0, 10);
  const regions = cities.reduce<Record<string, { total: number; population: number }>>((acc, city) => {
    if (!acc[city.region]) {
      acc[city.region] = { total: 0, population: 0 };
    }
    acc[city.region].total += city.totalEmissionsMt;
    acc[city.region].population += city.population;
    return acc;
  }, {});

  const regional = Object.entries(regions).map(([region, values]) => ({
    region,
    total: values.total,
    perCapita: values.total * 1_000_000 / values.population
  }));

  return {
    cityCount: cities.length,
    totalEmissions,
    averagePerCapita: totalEmissions * 1_000_000 / totalPopulation,
    topCities,
    regional
  };
}
