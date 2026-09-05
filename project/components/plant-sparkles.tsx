import { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const SPARKLE_POSITIONS = [
  { top: '8%', left: '18%', size: 29, delay: 0 },
  { top: '17%', right: '15%', size: 22, delay: 220 },
  { top: '36%', left: '5%', size: 20, delay: 430 },
  { top: '43%', right: '4%', size: 28, delay: 120 },
  { top: '63%', left: '15%', size: 18, delay: 600 },
  { top: '68%', right: '14%', size: 21, delay: 760 },
  { top: '25%', left: '42%', size: 17, delay: 820 },
  { top: '53%', right: '35%', size: 15, delay: 950 },
] as const;

export function PlantSparkles({ playKey }: { playKey: number }) {
  const progress = useMemo(
    () => SPARKLE_POSITIONS.map(() => new Animated.Value(0)),
    [],
  );

  useEffect(() => {
    if (playKey === 0) {
      return;
    }

    progress.forEach((value) => value.setValue(0));
    const animations = progress.map((value, index) => Animated.sequence([
      Animated.delay(SPARKLE_POSITIONS[index].delay),
      Animated.timing(value, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.delay(1_550),
      Animated.timing(value, { toValue: 0, duration: 620, useNativeDriver: true }),
    ]));

    Animated.parallel(animations).start();
    return () => animations.forEach((animation) => animation.stop());
  }, [playKey, progress]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {SPARKLE_POSITIONS.map((position, index) => (
        <Animated.View
          key={`${position.top}-${index}`}
          style={[
            styles.sparkle,
            {
              top: position.top,
              left: 'left' in position ? position.left : undefined,
              right: 'right' in position ? position.right : undefined,
            },
            {
              opacity: progress[index],
              transform: [{
                scale: progress[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.25, 1.15],
                }),
              }],
            },
          ]}
        >
          <Text style={[styles.sparkleText, { fontSize: position.size }]}>✦</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    color: '#FFF3A6',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
