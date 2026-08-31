import { Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { journalCardShadow, journalColors } from './theme';

interface TodayJournalCardProps {
  dateLabel: string;
  value: string;
  isLoading: boolean;
  isSaved: boolean;
  isSaving: boolean;
  onChangeText: (value: string) => void;
  onSave: () => void;
}

export function TodayJournalCard({
  dateLabel,
  value,
  isLoading,
  isSaved,
  isSaving,
  onChangeText,
  onSave,
}: TodayJournalCardProps) {
  const isSaveDisabled = isLoading || isSaving || isSaved || value.trim().length === 0;
  const saveLabel = isSaving ? 'Saving…' : isSaved ? 'Saved' : 'Save Entry';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Today</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
        <View style={styles.sparkleBadge}>
          <Sparkles color={journalColors.green} size={17} strokeWidth={1.6} />
        </View>
      </View>

      <TextInput
        accessibilityLabel="Today's journal entry"
        editable={!isLoading}
        maxLength={1000}
        multiline
        onChangeText={onChangeText}
        placeholder={
          isLoading ? 'Bringing back your entry…' : "How are you feeling today? What's on your mind?"
        }
        placeholderTextColor={journalColors.subtleText}
        scrollEnabled
        style={styles.input}
        textAlignVertical="top"
        value={value}
      />

      <View style={styles.footer}>
        <Text style={styles.characterCount}>{value.length}/1000</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaveDisabled }}
          disabled={isSaveDisabled}
          onPress={onSave}
          style={({ pressed }) => [
            styles.saveButton,
            isSaved && styles.savedButton,
            isSaveDisabled && !isSaved && styles.saveButtonDisabled,
            pressed && styles.saveButtonPressed,
          ]}
        >
          <Text style={styles.saveButtonText}>{saveLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 15,
    borderRadius: 22,
    backgroundColor: journalColors.lightGreen,
    ...journalCardShadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  eyebrow: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: journalColors.mutedText,
  },
  date: {
    fontFamily: 'Harmattan-SemiBold',
    fontSize: 20,
    lineHeight: 25,
    color: journalColors.ink,
  },
  sparkleBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: journalColors.lightPink,
  },
  input: {
    minHeight: 146,
    maxHeight: 210,
    borderWidth: 1,
    borderColor: 'rgba(55, 66, 61, 0.07)',
    borderRadius: 17,
    backgroundColor: journalColors.white,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: 'Raleway-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: journalColors.ink,
  },
  footer: {
    minHeight: 34,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  characterCount: {
    fontFamily: 'Raleway-Regular',
    fontSize: 10,
    color: journalColors.mutedText,
  },
  saveButton: {
    minWidth: 92,
    minHeight: 34,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: journalColors.pink,
  },
  savedButton: {
    backgroundColor: journalColors.white,
    borderWidth: 1,
    borderColor: journalColors.pink,
  },
  saveButtonDisabled: {
    opacity: 0.48,
  },
  saveButtonPressed: {
    opacity: 0.72,
  },
  saveButtonText: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 11,
    color: journalColors.ink,
  },
});
