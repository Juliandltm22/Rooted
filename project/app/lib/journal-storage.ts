import { supabase } from '@/app/lib/supabase';
import { CARE_MOODS, type Mood } from './care-history';

export interface JournalEntry {
  id: string;
  dateKey: string;
  text: string;
  mood: Mood | null;
  createdAt: string;
  updatedAt: string;
}

interface SaveJournalEntryInput {
  dateKey: string;
  text: string;
  mood: Mood | null;
}

// Shape of a row as it comes back from the `journal_entries` table
interface JournalEntryRow {
  id: string;
  date_key: string;
  content: string;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

const LOCAL_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

let writeQueue: Promise<void> = Promise.resolve();

function isMood(value: unknown): value is Mood {
  return typeof value === 'string' && CARE_MOODS.includes(value as Mood);
}

function rowToEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    dateKey: row.date_key,
    text: row.content,
    mood: isMood(row.mood) ? row.mood : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw error ?? new Error('You need to be signed in to use the journal.');
  }
  return data.user.id;
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  await writeQueue.catch(() => undefined);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, date_key, content, mood, created_at, updated_at')
    .eq('user_id', userData.user.id)
    .order('date_key', { ascending: false });

  if (error || !data) {
    console.warn('Unable to load journal entries from Supabase.', error);
    return [];
  }

  return (data as JournalEntryRow[]).map(rowToEntry);
}

export async function getJournalEntryForDate(dateKey: string): Promise<JournalEntry | null> {
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
      const userId = await getCurrentUserId();

      // One row per (user_id, date_key) — upsert keeps "one entry per day"
      const { data, error } = await supabase
        .from('journal_entries')
        .upsert(
          {
            user_id: userId,
            date_key: input.dateKey,
            content: input.text,
            mood: input.mood,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,date_key' },
        )
        .select('id, date_key, content, mood, created_at, updated_at')
        .single();

      if (error || !data) {
        throw error ?? new Error('Unable to save this journal entry.');
      }

      return rowToEntry(data as JournalEntryRow);
    });

  writeQueue = saveOperation.then(
    () => undefined,
    () => undefined,
  );

  return saveOperation;
}
