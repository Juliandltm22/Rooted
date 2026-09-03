import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type JournalEntry } from '@/app/lib/journal-storage';
import { JournalEntryCard } from './journal-entry-card';
import { journalColors } from './theme';

interface JournalHistoryViewProps {
  entries: JournalEntry[];
  onBack: () => void;
}

export function JournalHistoryView({ entries, onBack }: JournalHistoryViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to journal"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <ArrowLeft color={journalColors.ink} size={23} strokeWidth={1.7} />
        </Pressable>
        <View style={styles.headingBlock}>
          <Text style={styles.title}>All Entries</Text>
          <Text style={styles.count}>
            {entries.length} {entries.length === 1 ? 'reflection' : 'reflections'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {entries.length > 0 ? (
          entries.map((entry) => <JournalEntryCard compact={false} entry={entry} key={entry.id} />)
        ) : (
          <Text style={styles.emptyText}>No past entries yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    minHeight: 70,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: journalColors.lightGreen,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  headingBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Caveat-SemiBold',
    fontSize: 29,
    lineHeight: 32,
    color: journalColors.ink,
  },
  count: {
    fontFamily: 'Raleway-Regular',
    fontSize: 10,
    color: journalColors.subtleText,
  },
  headerSpacer: {
    width: 42,
  },
  content: {
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 5,
    paddingBottom: 140,
  },
  emptyText: {
    paddingVertical: 30,
    textAlign: 'center',
    fontFamily: 'Raleway-Regular',
    fontSize: 13,
    color: journalColors.subtleText,
  },
});

