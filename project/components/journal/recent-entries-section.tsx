import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type JournalEntry } from '@/app/lib/journal-storage';
import { JournalEntryCard } from './journal-entry-card';
import { journalColors } from './theme';

interface RecentEntriesSectionProps {
  entries: JournalEntry[];
  onShowAll: () => void;
}

export function RecentEntriesSection({ entries, onShowAll }: RecentEntriesSectionProps) {
  const recentEntries = entries.slice(0, 2);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recent Entries</Text>

      {recentEntries.length > 0 ? (
        <View style={styles.entries}>
          {recentEntries.map((entry) => (
            <JournalEntryCard entry={entry} key={entry.id} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Your reflections will grow here.</Text>
          <Text style={styles.emptyText}>Saved entries appear after their calendar day has passed.</Text>
        </View>
      )}

      {entries.length > 2 ? (
        <Pressable hitSlop={8} onPress={onShowAll} style={styles.showAllButton}>
          <Text style={styles.showAllText}>Show All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 25,
  },
  title: {
    fontFamily: 'Harmattan-SemiBold',
    fontSize: 21,
    lineHeight: 25,
    color: journalColors.ink,
    marginBottom: 10,
  },
  entries: {
    gap: 12,
  },
  emptyCard: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: journalColors.midGreen,
    borderRadius: 18,
    backgroundColor: 'rgba(221, 231, 199, 0.28)',
  },
  emptyTitle: {
    fontFamily: 'Caveat-SemiBold',
    fontSize: 20,
    color: journalColors.ink,
  },
  emptyText: {
    marginTop: 4,
    fontFamily: 'Raleway-Regular',
    fontSize: 11,
    lineHeight: 17,
    color: journalColors.mutedText,
  },
  showAllButton: {
    alignSelf: 'flex-end',
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginTop: 5,
  },
  showAllText: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 11,
    color: journalColors.green,
    textDecorationLine: 'underline',
  },
});

