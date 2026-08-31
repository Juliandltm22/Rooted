import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { type WeeklyEmotionData } from '@/app/lib/progress-data';
import { journalColors } from './theme';

interface EmotionAnalyticsChartProps {
  data: WeeklyEmotionData;
  selectedDateKey: string;
}

interface ChartPoint {
  dateKey: string;
  x: number;
  y: number;
}

const CHART_HEIGHT = 145;
const HORIZONTAL_INSET = 12;
const VERTICAL_INSET = 14;

function getSmoothPath(points: ChartPoint[]) {
  if (points.length === 0) {
    return '';
  }

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
}

export function EmotionAnalyticsChart({ data, selectedDateKey }: EmotionAnalyticsChartProps) {
  const [width, setWidth] = useState(0);

  const points = useMemo<ChartPoint[]>(() => {
    if (width <= 0 || data.points.length === 0) {
      return [];
    }

    const usableWidth = width - HORIZONTAL_INSET * 2;
    const usableHeight = CHART_HEIGHT - VERTICAL_INSET * 2;

    return data.points.map((point, index) => ({
      dateKey: point.dateKey,
      x:
        HORIZONTAL_INSET +
        (data.points.length === 1 ? usableWidth / 2 : (usableWidth * index) / (data.points.length - 1)),
      y: VERTICAL_INSET + (1 - point.score / 100) * usableHeight,
    }));
  }, [data.points, width]);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View onLayout={onLayout} style={styles.card}>
      <Text style={styles.caption}>Mood trend</Text>
      {width > 0 ? (
        <Svg height={CHART_HEIGHT} width={width}>
          <Line
            stroke={journalColors.border}
            strokeDasharray="4 5"
            strokeWidth={1}
            x1={HORIZONTAL_INSET}
            x2={width - HORIZONTAL_INSET}
            y1={CHART_HEIGHT * 0.34}
            y2={CHART_HEIGHT * 0.34}
          />
          <Line
            stroke={journalColors.border}
            strokeDasharray="4 5"
            strokeWidth={1}
            x1={HORIZONTAL_INSET}
            x2={width - HORIZONTAL_INSET}
            y1={CHART_HEIGHT * 0.68}
            y2={CHART_HEIGHT * 0.68}
          />
          <Path
            d={getSmoothPath(points)}
            fill="none"
            stroke={journalColors.green}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
          />
          {points
            .filter((point) => point.dateKey === selectedDateKey)
            .map((point) => (
              <Circle
                cx={point.x}
                cy={point.y}
                fill={journalColors.pink}
                key={point.dateKey}
                r={4.5}
                stroke={journalColors.ink}
                strokeWidth={1}
              />
            ))}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CHART_HEIGHT + 25,
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: journalColors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  caption: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 1,
    fontFamily: 'Raleway-SemiBold',
    fontSize: 9,
    color: journalColors.green,
  },
});

