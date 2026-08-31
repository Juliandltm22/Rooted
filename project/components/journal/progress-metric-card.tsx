import { Image, type ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { journalCardShadow, journalColors } from './theme';

interface ProgressMetricCardProps {
  label: string;
  value: string;
  image: ImageSourcePropType;
}

export function ProgressMetricCard({ label, value, image }: ProgressMetricCardProps) {
  return (
    <View style={styles.card}>
      <Image resizeMode="contain" source={image} style={styles.image} />
      <Text adjustsFontSizeToFit numberOfLines={1} style={styles.value}>
        {value}
      </Text>
      <Text numberOfLines={2} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 126,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: journalColors.border,
    borderRadius: 18,
    backgroundColor: journalColors.white,
    justifyContent: 'flex-end',
    ...journalCardShadow,
  },
  image: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,
    height: 50,
  },
  value: {
    paddingRight: 36,
    fontFamily: 'Harmattan-Regular',
    fontSize: 27,
    lineHeight: 31,
    color: journalColors.ink,
  },
  label: {
    minHeight: 28,
    fontFamily: 'Raleway-Regular',
    fontSize: 10,
    lineHeight: 14,
    color: journalColors.subtleText,
  },
});

