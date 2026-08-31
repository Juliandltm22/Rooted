import AsyncStorage from '@react-native-async-storage/async-storage';

export type Mood = 'great' | 'calm' | 'tired' | 'sad' | 'stressed' | 'okay';

export interface CareHistoryItem {
  dateKey: string;
  mood: Mood | null;
  sleepHours: number | null;
}

export const CARE_DAYS_STORAGE_KEY = '@rooted/care-days-v1';
export const CARE_MOODS: readonly Mood[] = [
  'great',
  'calm',
  'tired',
  'sad',
  'stressed',
  'okay',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMood(value: unknown): value is Mood {
  return typeof value === 'string' && CARE_MOODS.includes(value as Mood);
}

// Read-only adapter over the Care check-in store. Journal and Progress can swap
// this boundary for a shared Supabase repository without depending on Care UI.
export async function getCareHistoryByDate(): Promise<Record<string, CareHistoryItem>> {
  try {
    const storedValue = await AsyncStorage.getItem(CARE_DAYS_STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!isRecord(parsedValue) || !isRecord(parsedValue.records)) {
      return {};
    }

    return Object.entries(parsedValue.records).reduce<Record<string, CareHistoryItem>>(
      (history, [dateKey, value]) => {
        if (!isRecord(value) || value.date !== dateKey) {
          return history;
        }

        const mood = value.emotion === null || isMood(value.emotion) ? value.emotion : null;
        const sleepHours =
          value.sleepHours === null ||
          (typeof value.sleepHours === 'number' && Number.isFinite(value.sleepHours))
            ? value.sleepHours
            : null;

        history[dateKey] = { dateKey, mood, sleepHours };
        return history;
      },
      {},
    );
  } catch (error) {
    console.warn('Unable to read Care history.', error);
    return {};
  }
}

