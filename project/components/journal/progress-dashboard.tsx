import { Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { addCalendarDays, formatMonthYear, getLocalDateKey } from '@/app/lib/local-date';
import { getMockDailyProgress, getMockWeeklyEmotionData } from '@/app/lib/progress-data';
import { EmotionAnalyticsChart } from './emotion-analytics-chart';
import { ProgressMetricCard } from './progress-metric-card';
import { journalColors } from './theme';
import { WeekSelector } from './week-selector';

export function ProgressDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dailyMetrics = useMemo(() => getMockDailyProgress(selectedDate), [selectedDate]);
  const weeklyEmotionData = useMemo(
    () => getMockWeeklyEmotionData(selectedDate),
    [selectedDate],
  );

  const changeWeek = (amount: number) => {
    setSelectedDate((currentDate) => addCalendarDays(currentDate, amount * 7));
  };

  const metricCards = [
    {
      key: 'hydration',
      label: 'Hydration',
      value: `${dailyMetrics.hydration}%`,
      image: require('@/assets/images/sun-icon.png'),
    },
    {
      key: 'bloom-progress',
      label: 'Bloom Progress',
      value: `${dailyMetrics.bloomProgress}%`,
      image: require('@/assets/images/red-flower-icon.png'),
    },
    {
      key: 'sleep-quality',
      label: 'Sleep Quality',
      value: `${dailyMetrics.sleepQuality} hrs`,
      image: require('@/assets/images/bee-icon.png'),
    },
    {
      key: 'mood-balance',
      label: 'Mood Balance',
      value: `${dailyMetrics.moodBalance}%`,
      image: require('@/assets/images/spiral-icon.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.month}>{formatMonthYear(selectedDate)}</Text>
      <Text style={styles.title}>Emotion Analytics</Text>

      <WeekSelector
        onNextWeek={() => changeWeek(1)}
        onPreviousWeek={() => changeWeek(-1)}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />

      <View style={styles.insightLabel}>
        <Sparkles color={journalColors.green} size={13} strokeWidth={1.6} />
        <Text style={styles.insightText}>AI Gardener Insights</Text>
      </View>

      <EmotionAnalyticsChart
        data={weeklyEmotionData}
        selectedDateKey={getLocalDateKey(selectedDate)}
      />

      <View style={styles.metricGrid}>
        {metricCards.map((metric) => (
          <ProgressMetricCard
            image={metric.image}
            key={metric.key}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  month: {
    textAlign: 'center',
    fontFamily: 'Raleway-Regular',
    fontSize: 11,
    color: journalColors.subtleText,
  },
  title: {
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'Caveat-SemiBold',
    fontSize: 30,
    lineHeight: 37,
    color: journalColors.ink,
  },
  insightLabel: {
    marginTop: 24,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightText: {
    fontFamily: 'Raleway-SemiBold',
    fontSize: 10,
    color: journalColors.mutedText,
  },
  metricGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

