import { Sparkles } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { type Mood } from '@/app/lib/care-history';
import { MOOD_OPTIONS } from '@/app/lib/moods';
import { journalCardShadow, journalColors } from './theme';

interface TodayJournalCardProps {
  dateLabel: string;
  value: string;
  mood: Mood | null;
  isLoading: boolean;
  isSaved: boolean;
  isSaving: boolean;
  onChangeText: (value: string) => void;
  onSelectMood: (mood: Mood) => void;
  onSave: () => void;
}

export function TodayJournalCard({
  dateLabel,
  value,
  mood,
  isLoading,
  isSaved,
  isSaving,
  onChangeText,
  onSelectMood,
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

      <Text style={styles.moodLabel}>{"I'm feeling..."}</Text>
      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((option) => {
          const isSelected = option.id === mood;
          return (
            <Pressable
              key={option.id}
              disabled={isLoading}
              onPress={() => onSelectMood(option.id)}
              style={styles.moodOptionColumn}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Feeling ${option.label}`}
            >
              <View style={[styles.moodOption, isSelected && styles.moodOptionSelected]}>
                <Image source={option.image} style={styles.moodImage} resizeMode="contain" />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.moodOptionLabel, isSelected && styles.moodOptionLabelSelected]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
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
  moodLabel: {
    marginBottom: 8,
    fontFamily: 'Raleway-SemiBold',
    fontSize: 11,
    color: journalColors.mutedText,
  },
  moodRow: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOptionColumn: {
    alignItems: 'center',
    width: 44,
  },
  moodOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: journalColors.white,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  moodOptionSelected: {
    borderColor: journalColors.green,
    backgroundColor: journalColors.midGreen,
  },
  moodImage: {
    width: 26,
    height: 26,
  },
  moodOptionLabel: {
    marginTop: 4,
    fontFamily: 'Raleway-Regular',
    fontSize: 9,
    color: journalColors.mutedText,
  },
  moodOptionLabelSelected: {
    fontFamily: 'Raleway-SemiBold',
    color: journalColors.ink,
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