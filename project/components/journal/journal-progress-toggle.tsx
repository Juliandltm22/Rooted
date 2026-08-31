import { Pressable, StyleSheet, Text, View } from 'react-native';
import { journalColors } from './theme';

export type JournalView = 'journal' | 'progress';

interface JournalProgressToggleProps {
  value: JournalView;
  onChange: (value: JournalView) => void;
}

const OPTIONS: { label: string; value: JournalView }[] = [
  { label: 'Journal', value: 'journal' },
  { label: 'Progress', value: 'progress' },
];

export function JournalProgressToggle({ value, onChange }: JournalProgressToggleProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            hitSlop={5}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minHeight: 38,
  },
  option: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 18,
  },
  optionSelected: {
    backgroundColor: journalColors.green,
  },
  optionPressed: {
    opacity: 0.72,
  },
  label: {
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    color: journalColors.subtleText,
  },
  labelSelected: {
    fontFamily: 'Raleway-SemiBold',
    color: journalColors.white,
  },
});

