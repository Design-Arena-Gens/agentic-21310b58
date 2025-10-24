'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DietProfile = 'vegan' | 'vegetarian' | 'lightMeat' | 'mediumMeat' | 'heavyMeat';

export interface CalculatorInputs {
  carKilometres: number;
  airTravelHours: number;
  publicTransitKilometres: number;
  electricityKwh: number;
  dietProfile: DietProfile;
  wasteKg: number;
  recycleRate: number;
  compostRate: number;
}

export interface EmissionBreakdown {
  transportation: number;
  energy: number;
  diet: number;
  waste: number;
}

export interface CalculationRecord {
  id: string;
  timestamp: string;
  inputs: CalculatorInputs;
  totalTonnes: number;
  breakdown: EmissionBreakdown;
  comparisonToAverage: number;
}

export interface CalculatorState {
  latest?: CalculationRecord;
  history: CalculationRecord[];
  addCalculation: (record: CalculationRecord) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist<CalculatorState>(
    (set) => ({
      latest: undefined,
      history: [],
      addCalculation: (record) =>
        set((state) => ({
          latest: record,
          history: [record, ...state.history]
        }))
    }),
    {
      name: 'ecotrack-calculation-history',
      storage:
        typeof window === 'undefined'
          ? undefined
          : createJSONStorage(() => window.localStorage)
    }
  )
);
