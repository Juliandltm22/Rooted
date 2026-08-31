import { type Mood } from './care-history';
import { getLocalDateKey, getWeekDates } from './local-date';

export interface DailyProgressMetrics {
  dateKey: string;
  hydration: number;
  bloomProgress: number;
  sleepQuality: number;
  moodBalance: number;
}

export interface WeeklyEmotionPoint {
  dateKey: string;
  score: number;
}

export interface WeeklyEmotionData {
  weekStartKey: string;
  points: WeeklyEmotionPoint[];
}

// Friendly Care moods can later feed the graph through this numeric boundary.
export const CARE_MOOD_SCORES: Record<Mood, number> = {
  great: 92,
  calm: 78,
  okay: 62,
  tired: 48,
  stressed: 34,
  sad: 24,
};

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mockValue(dateKey: string, salt: string, minimum: number, maximum: number) {
  const ratio = (hashText(`${dateKey}:${salt}`) % 10_000) / 9_999;
  return minimum + ratio * (maximum - minimum);
}

export function getMockDailyProgress(date: Date): DailyProgressMetrics {
  const dateKey = getLocalDateKey(date);

  return {
    dateKey,
    hydration: Math.round(mockValue(dateKey, 'hydration', 68, 97)),
    bloomProgress: Math.round(mockValue(dateKey, 'bloom', 56, 91)),
    sleepQuality: Math.round(mockValue(dateKey, 'sleep', 6, 9) * 2) / 2,
    moodBalance: Math.round(mockValue(dateKey, 'mood', 58, 94)),
  };
}

export function getMockWeeklyEmotionData(dateInWeek: Date): WeeklyEmotionData {
  const weekDates = getWeekDates(dateInWeek);

  return {
    weekStartKey: getLocalDateKey(weekDates[0]),
    points: weekDates.map((date, index) => {
      const dateKey = getLocalDateKey(date);
      const baseline = mockValue(dateKey, 'emotion', 30, 84);
      const gentleCurve = Math.sin(index * 1.35) * 9;

      return {
        dateKey,
        score: Math.max(18, Math.min(94, Math.round(baseline + gentleCurve))),
      };
    }),
  };
}

