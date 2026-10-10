import { getMostRecentQuantitySample, isHealthDataAvailable, queryStatisticsForQuantity, requestAuthorization } from '@kingstinct/react-native-healthkit';
import { Platform } from 'react-native';

import { normalizeBodyFat } from './bodycomp';

export interface HealthSnapshot {
  weightKg?: number;
  heightCm?: number;
  bodyFatPct?: number;
  leanMassKg?: number;
  restingHr?: number;
  vo2max?: number;
  stepsToday?: number;
  activeKcalToday?: number;
  /** ISO date of the newest body-mass sample, used to log it once. */
  weightDate?: string;
}

const READ = [
  'HKQuantityTypeIdentifierBodyMass',
  'HKQuantityTypeIdentifierBodyFatPercentage',
  'HKQuantityTypeIdentifierLeanBodyMass',
  'HKQuantityTypeIdentifierHeight',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierVO2Max',
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
] as const;

/** HealthKit exists only on iPhone (and needs a development build, not Expo Go). */
export function healthSupported(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    return isHealthDataAvailable();
  } catch {
    return false;
  }
}

export async function connectHealth(): Promise<boolean> {
  if (!healthSupported()) return false;
  return requestAuthorization({ toRead: READ });
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Each read is independent: a type the user declined (or has no data for) just stays undefined. */
async function safe<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function readHealthSnapshot(): Promise<HealthSnapshot> {
  if (!healthSupported()) return {};
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const today = { filter: { date: { startDate: midnight } } };

  const [mass, fat, lean, height, rhr, vo2, steps, active] = await Promise.all([
    safe(() => getMostRecentQuantitySample('HKQuantityTypeIdentifierBodyMass', 'kg')),
    safe(() => getMostRecentQuantitySample('HKQuantityTypeIdentifierBodyFatPercentage', '%')),
    safe(() => getMostRecentQuantitySample('HKQuantityTypeIdentifierLeanBodyMass', 'kg')),
    safe(() => getMostRecentQuantitySample('HKQuantityTypeIdentifierHeight', 'cm')),
    safe(() => getMostRecentQuantitySample('HKQuantityTypeIdentifierRestingHeartRate', 'count/min')),
    safe(() => getMostRecentQuantitySample('HKQuantityTypeIdentifierVO2Max', 'ml/(kg*min)')),
    safe(() => queryStatisticsForQuantity('HKQuantityTypeIdentifierStepCount', ['cumulativeSum'], { ...today, unit: 'count' })),
    safe(() => queryStatisticsForQuantity('HKQuantityTypeIdentifierActiveEnergyBurned', ['cumulativeSum'], { ...today, unit: 'kcal' })),
  ]);

  return {
    weightKg: mass ? r1(mass.quantity) : undefined,
    weightDate: mass ? new Date(mass.startDate).toISOString().slice(0, 10) : undefined,
    bodyFatPct: fat ? normalizeBodyFat(fat.quantity) : undefined,
    leanMassKg: lean ? r1(lean.quantity) : undefined,
    heightCm: height ? Math.round(height.quantity) : undefined,
    restingHr: rhr ? Math.round(rhr.quantity) : undefined,
    vo2max: vo2 ? r1(vo2.quantity) : undefined,
    stepsToday: steps?.sumQuantity ? Math.round(steps.sumQuantity.quantity) : undefined,
    activeKcalToday: active?.sumQuantity ? Math.round(active.sumQuantity.quantity) : undefined,
  };
}
