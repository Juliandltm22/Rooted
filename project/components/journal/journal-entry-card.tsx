import { StyleSheet, Text, View } from 'react-native';
import { type Mood } from '@/app/lib/care-history';
import { type JournalEntry } from '@/app/lib/journal-storage';
import { getRelativeDateLabel } from '@/app/lib/local-date';
import { journalCardShadow, journalColors } from './theme';

interface JournalEntryCardProps {
  entry: JournalEntry;
  compact?: boolean;
}

const MOOD_PRESENTATION: Record<Mood, { backgroundColor: string; label: string }> = {
  great: { backgroundColor: '#F2DDAE', label: 'Great' },
  calm: { backgroundColor: '#E8D7E5', label: 'Calm' },
  tired: { backgroundColor: '#DDE7C7', label: 'Tired' },
  sad: { backgroundColor: '#D6E1E7', label: 'Sad' },
  stressed: { backgroundColor: '#E8D7D2', label: 'Stressed' },
  okay: { backgroundColor: '#E8E6D7', label: 'Okay' },
};

function formatSavedTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function JournalEntryCard({ entry, compact = true }: JournalEntryCardProps) {
  const moodPresentation = entry.mood ? MOOD_PRESENTATION[entry.mood] : null;
  const savedTime = formatSavedTime(entry.updatedAt);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{getRelativeDateLabel(entry.dateKey)}</Text>
        <View
          style={[
            styles.moodPill,
            { backgroundColor: moodPresentation?.backgroundColor ?? journalColors.border },
          ]}
        >
          <View style={styles.moodDot} />
          <Text style={styles.moodText}>{moodPresentation?.label ?? 'No check-in'}</Text>
        </View>
      </View>

      <Text numberOfLines={compact ? 3 : undefined} style={styles.preview}>
        {entry.text}
      </Text>

      {savedTime ? <Text style={styles.savedTime}>Saved at {savedTime}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: journalColors.border,
    backgroundColor: journalColors.white,
    ...journalCardShadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  date: {
    flex: 1,
    fontFamily: 'Harmattan-SemiBold',
    fontSize: 17,
    lineHeight: 21,
    color: journalColors.ink,
  },
  moodPill: {
    minHeight: 23,
    maxWidth: 112,
    paddingHorizontal: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  moodDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: journalColors.green,
  },
  moodText: {
    flexShrink: 1,
    fontFamily: 'Raleway-SemiBold',
    fontSize: 9,
    color: journalColors.ink,
  },
  preview: {
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    lineHeight: 18,
    color: journalColors.ink,
  },
  savedTime: {
    marginTop: 9,
    fontFamily: 'Raleway-Regular',
    fontSize: 9,
    color: journalColors.subtleText,
  },
});

