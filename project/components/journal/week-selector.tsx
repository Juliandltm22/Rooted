import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLocalDateKey, getWeekDates } from '@/app/lib/local-date';
import { journalColors } from './theme';

interface WeekSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function WeekSelector({
  selectedDate,
  onSelectDate,
  onPreviousWeek,
  onNextWeek,
}: WeekSelectorProps) {
  const selectedDateKey = getLocalDateKey(selectedDate);
  const todayKey = getLocalDateKey();
  const weekDates = getWeekDates(selectedDate);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Previous week"
        hitSlop={6}
        onPress={onPreviousWeek}
        style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
      >
        <ChevronLeft color={journalColors.green} size={20} strokeWidth={1.7} />
      </Pressable>

      <View style={styles.days}>
        {weekDates.map((date) => {
          const dateKey = getLocalDateKey(date);
          const isSelected = dateKey === selectedDateKey;
          const isToday = dateKey === todayKey;

          return (
            <Pressable
              accessibilityLabel={date.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              accessibilityState={{ selected: isSelected }}
              key={dateKey}
              onPress={() => onSelectDate(date)}
              style={styles.dayColumn}
            >
              <View
                style={[
                  styles.dateCircle,
                  isToday && styles.todayCircle,
                  isSelected && styles.selectedCircle,
                ]}
              >
                <Text style={[styles.dateNumber, isSelected && styles.selectedText]}>
                  {date.getDate()}
                </Text>
              </View>
              <Text style={[styles.dayLabel, isSelected && styles.selectedDayLabel]}>
                {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityLabel="Next week"
        hitSlop={6}
        onPress={onNextWeek}
        style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
      >
        <ChevronRight color={journalColors.green} size={20} strokeWidth={1.7} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  arrowButton: {
    width: 28,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.55,
  },
  days: {
    flex: 1,
    flexDirection: 'row',
  },
  dayColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  dateCircle: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(221, 231, 199, 0.58)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  todayCircle: {
    borderColor: journalColors.green,
  },
  selectedCircle: {
    backgroundColor: journalColors.green,
    borderColor: journalColors.green,
  },
  dateNumber: {
    fontFamily: 'Harmattan-SemiBold',
    fontSize: 16,
    lineHeight: 19,
    color: journalColors.ink,
  },
  selectedText: {
    color: journalColors.white,
  },
  dayLabel: {
    marginTop: 3,
    fontFamily: 'Raleway-Regular',
    fontSize: 9,
    color: journalColors.subtleText,
  },
  selectedDayLabel: {
    fontFamily: 'Raleway-SemiBold',
    color: journalColors.ink,
  },
});

