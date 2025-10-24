import { CalculatorInputs, CalculationRecord, EmissionBreakdown } from './store';
import { DIET_EMISSIONS_TONNES, GLOBAL_AVERAGE_TONNES } from '../data/constants';

const CAR_EMISSION_FACTOR_TONNES_PER_KM = 0.000192; // 192 g/km
const AIR_TRAVEL_TONNES_PER_HOUR = 0.09; // 90 kg/hour
const PUBLIC_TRANSIT_TONNES_PER_KM = 0.000045; // 45 g/km
const ELECTRICITY_TONNES_PER_KWH = 0.00082; // aligned with Indian grid mix
const WASTE_TONNES_PER_KG = 0.00052; // 520 g/kg

type Recommendation = {
  title: string;
  description: string;
};

export const computeBreakdown = (inputs: CalculatorInputs): EmissionBreakdown => {
  const transportation =
    inputs.carKilometres * CAR_EMISSION_FACTOR_TONNES_PER_KM +
    inputs.airTravelHours * AIR_TRAVEL_TONNES_PER_HOUR +
    inputs.publicTransitKilometres * PUBLIC_TRANSIT_TONNES_PER_KM;

  const energy = inputs.electricityKwh * ELECTRICITY_TONNES_PER_KWH;
  const diet = DIET_EMISSIONS_TONNES[inputs.dietProfile];

  const wasteReductionFactor = 1 - Math.min((inputs.recycleRate + inputs.compostRate) / 200, 0.85);
  const waste = inputs.wasteKg * WASTE_TONNES_PER_KG * wasteReductionFactor;

  return {
    transportation,
    energy,
    diet,
    waste
  };
};

export const deriveRecord = (inputs: CalculatorInputs): CalculationRecord => {
  const breakdown = computeBreakdown(inputs);
  const totalTonnes =
    breakdown.transportation + breakdown.energy + breakdown.diet + breakdown.waste;
  const comparisonToAverage = ((totalTonnes - GLOBAL_AVERAGE_TONNES) / GLOBAL_AVERAGE_TONNES) * 100;

  return {
    id: `${Date.now()}`,
    timestamp: new Date().toISOString(),
    inputs,
    breakdown,
    totalTonnes,
    comparisonToAverage
  };
};

export const buildRecommendations = (
  inputs: CalculatorInputs,
  breakdown: EmissionBreakdown
): Recommendation[] => {
  const suggestions: Recommendation[] = [];

  if (breakdown.transportation > 3) {
    suggestions.push({
      title: 'Shift Commutes',
      description:
        'Combine trips, adopt public transit twice a week, and explore remote work days to cut vehicle kilometres.'
    });
  } else if (inputs.publicTransitKilometres < inputs.carKilometres * 0.2) {
    suggestions.push({
      title: 'Increase Transit Share',
      description:
        'Blend cycling or metro for routes under 10 km to immediately cut commuting emissions by up to 25%.'
    });
  }

  if (breakdown.energy > 2.5) {
    suggestions.push({
      title: 'Upgrade Home Efficiency',
      description:
        'Switch to 5-star appliances, seal air leaks, and explore rooftop solar to trim electricity load.'
    });
  } else {
    suggestions.push({
      title: 'Automate Energy Monitoring',
      description:
        'Deploy smart plugs and weekly energy audits to keep your electricity footprint trending down.'
    });
  }

  if (inputs.dietProfile === 'heavyMeat' || inputs.dietProfile === 'mediumMeat') {
    suggestions.push({
      title: 'Experiment with Low-Carbon Meals',
      description:
        'Swap two meat-heavy meals each week with plant-forward recipes; this saves ~0.5 t CO₂e annually.'
    });
  }

  if (inputs.recycleRate < 60) {
    suggestions.push({
      title: 'Expand Recycling Streams',
      description:
        'Introduce community recycling drop-offs and audit quarterly to raise diversion rates beyond 70%.'
    });
  }

  return suggestions.slice(0, 4);
};
