import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCareHistoryByDate } from '@/app/lib/care-history';
import {
  getJournalEntries,
  saveJournalEntry,
  type JournalEntry,
} from '@/app/lib/journal-storage';
import {
  formatFriendlyDate,
  getDateFromLocalKey,
  getLocalDateKey,
} from '@/app/lib/local-date';
import { JournalHistoryView } from '@/components/journal/journal-history-view';
import {
  JournalProgressToggle,
  type JournalView,
} from '@/components/journal/journal-progress-toggle';
import { ProgressDashboard } from '@/components/journal/progress-dashboard';
import { RecentEntriesSection } from '@/components/journal/recent-entries-section';
import { journalColors } from '@/components/journal/theme';
import { TodayJournalCard } from '@/components/journal/today-journal-card';
import { appStyles } from '@/styles/styles';

export default function JournalScreen() {
  const initialDateKey = useRef(getLocalDateKey()).current;
  const activeDateKeyRef = useRef(initialDateKey);
  const hasHydratedRef = useRef(false);
  const [activeView, setActiveView] = useState<JournalView>('journal');
  const [isShowingHistory, setIsShowingHistory] = useState(false);
  const [todayDateKey, setTodayDateKey] = useState(initialDateKey);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [lastPersistedText, setLastPersistedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const refreshJournal = useCallback(async () => {
    const currentDateKey = getLocalDateKey();
    const shouldHydrateDraft =
      !hasHydratedRef.current || activeDateKeyRef.current !== currentDateKey;

    activeDateKeyRef.current = currentDateKey;
    setTodayDateKey(currentDateKey);

    try {
      const [storedEntries, careHistory] = await Promise.all([
        getJournalEntries(),
        getCareHistoryByDate(),
      ]);
      const hydratedEntries = storedEntries.map((entry) => ({
        ...entry,
        mood: careHistory[entry.dateKey]
          ? careHistory[entry.dateKey].mood
          : entry.mood,
      }));
      const currentEntry = hydratedEntries.find(
        (entry) => entry.dateKey === currentDateKey,
      );

      setEntries(hydratedEntries);
      setLastPersistedText(currentEntry?.text ?? null);

      if (shouldHydrateDraft) {
        setDraft(currentEntry?.text ?? '');
      }

      hasHydratedRef.current = true;
      setStatusMessage(null);
    } catch (error) {
      console.warn('Unable to load the journal.', error);

      if (shouldHydrateDraft) {
        setDraft('');
        setLastPersistedText(null);
      }

      setStatusMessage('Your journal could not be loaded. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshJournal();
    }, [refreshJournal]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshJournal();
      }
    });

    return () => subscription.remove();
  }, [refreshJournal]);

  const historicalEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.dateKey !== todayDateKey)
        .sort((left, right) => right.dateKey.localeCompare(left.dateKey)),
    [entries, todayDateKey],
  );

  const isSaved = lastPersistedText !== null && draft === lastPersistedText;
  const todayLabel = formatFriendlyDate(getDateFromLocalKey(todayDateKey));

  const handleSave = async () => {
    if (isSaving || isSaved || draft.trim().length === 0) {
      return;
    }

    const dateKeyBeingSaved = activeDateKeyRef.current;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const careHistory = await getCareHistoryByDate();
      const savedEntry = await saveJournalEntry({
        dateKey: dateKeyBeingSaved,
        text: draft,
        mood: careHistory[dateKeyBeingSaved]?.mood ?? null,
      });

      if (activeDateKeyRef.current !== dateKeyBeingSaved) {
        await refreshJournal();
        return;
      }

      setEntries((currentEntries) =>
        [
          savedEntry,
          ...currentEntries.filter((entry) => entry.dateKey !== savedEntry.dateKey),
        ].sort((left, right) => right.dateKey.localeCompare(left.dateKey)),
      );
      setLastPersistedText(savedEntry.text);
    } catch (error) {
      console.warn('Unable to save the journal entry.', error);
      setStatusMessage('This entry was not saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewChange = (nextView: JournalView) => {
    Keyboard.dismiss();
    setIsShowingHistory(false);
    setActiveView(nextView);
  };

  if (isShowingHistory) {
    return (
      <SafeAreaView edges={['top']} style={appStyles.backgroundContainer}>
        <JournalHistoryView
          entries={historicalEntries}
          onBack={() => setIsShowingHistory(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={appStyles.backgroundContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <JournalProgressToggle onChange={handleViewChange} value={activeView} />

          {activeView === 'journal' ? (
            <>
              <TodayJournalCard
                dateLabel={todayLabel}
                isLoading={isLoading}
                isSaved={isSaved}
                isSaving={isSaving}
                onChangeText={setDraft}
                onSave={() => void handleSave()}
                value={draft}
              />

              {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

              <RecentEntriesSection
                entries={historicalEntries}
                onShowAll={() => {
                  Keyboard.dismiss();
                  setIsShowingHistory(true);
                }}
              />
            </>
          ) : (
            <ProgressDashboard />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 140,
  },
  statusMessage: {
    marginTop: 9,
    fontFamily: 'Raleway-Regular',
    fontSize: 11,
    lineHeight: 16,
    color: journalColors.error,
    textAlign: 'center',
  },
});
