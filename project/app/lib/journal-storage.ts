import AsyncStorage from '@react-native-async-storage/async-storage';
import { CARE_MOODS, type Mood } from './care-history';

export interface JournalEntry {
  id: string;
  dateKey: string;
  text: string;
  mood: Mood | null;
  createdAt: string;
  updatedAt: string;
}

interface JournalStore {
  version: 1;
  records: Record<string, JournalEntry>;
}

interface SaveJournalEntryInput {
  dateKey: string;
  text: string;
  mood: Mood | null;
}

const JOURNAL_STORAGE_KEY = '@rooted/journal-entries-v1';
const LOCAL_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
let writeQueue: Promise<void> = Promise.resolve();

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as JournalEntry;
  return (
    typeof entry.id === 'string' &&
    typeof entry.dateKey === 'string' &&
    LOCAL_DATE_KEY_PATTERN.test(entry.dateKey) &&
    typeof entry.text === 'string' &&
    entry.text.length <= 1000 &&
    (entry.mood === null || CARE_MOODS.includes(entry.mood)) &&
    typeof entry.createdAt === 'string' &&
    typeof entry.updatedAt === 'string'
  );
}

async function loadJournalStore(): Promise<JournalStore> {
  const storedValue = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);

  if (!storedValue) {
    return { version: 1, records: {} };
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    if (!parsedValue || typeof parsedValue !== 'object' || !('records' in parsedValue)) {
      return { version: 1, records: {} };
    }

    const records = (parsedValue as { records: unknown }).records;
    if (!records || typeof records !== 'object') {
      return { version: 1, records: {} };
    }

    const validRecords = Object.entries(records).reduce<Record<string, JournalEntry>>(
      (entries, [dateKey, value]) => {
        if (isJournalEntry(value) && value.dateKey === dateKey) {
          entries[dateKey] = value;
        }
        return entries;
      },
      {},
    );

    return { version: 1, records: validRecords };
  } catch (error) {
    console.warn('Unable to restore journal entries.', error);
    return { version: 1, records: {} };
  }
}

export async function getJournalEntries() {
  await writeQueue.catch(() => undefined);
  const store = await loadJournalStore();
  return Object.values(store.records).sort((left, right) =>
    right.dateKey.localeCompare(left.dateKey),
  );
}

export async function getJournalEntryForDate(dateKey: string) {
  const entries = await getJournalEntries();
  return entries.find((entry) => entry.dateKey === dateKey) ?? null;
}

export function saveJournalEntry(input: SaveJournalEntryInput): Promise<JournalEntry> {
  if (!LOCAL_DATE_KEY_PATTERN.test(input.dateKey)) {
    return Promise.reject(new Error('A valid local calendar date is required.'));
  }

  if (input.text.length > 1000) {
    return Promise.reject(new Error('Journal entries are limited to 1000 characters.'));
  }

  const saveOperation = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const store = await loadJournalStore();
      const existingEntry = store.records[input.dateKey];
      const now = new Date().toISOString();
      const savedEntry: JournalEntry = {
        id: existingEntry?.id ?? `journal-${input.dateKey}`,
        dateKey: input.dateKey,
        text: input.text,
        mood: input.mood,
        createdAt: existingEntry?.createdAt ?? now,
        updatedAt: now,
      };

      const nextStore: JournalStore = {
        version: 1,
        records: {
          ...store.records,
          [input.dateKey]: savedEntry,
        },
      };

      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextStore));
      return savedEntry;
    });

  writeQueue = saveOperation.then(
    () => undefined,
    () => undefined,
  );

  return saveOperation;
}

