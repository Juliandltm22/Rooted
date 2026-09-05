// The 6 mood options extracted into one shared source, so Care and Journal can never drift out of sync with each other

import type { ImageSourcePropType } from 'react-native';
import type { Mood } from '@/app/lib/care-history';

export interface MoodOption {
    id: Mood;
    label: string;
    image: ImageSourcePropType;
}

export const MOOD_OPTIONS: MoodOption[] = [
    { id: 'great', label: 'Great', image: require('@/assets/images/mood-great.png') },
    { id: 'calm', label: 'Calm', image: require('@/assets/images/mood-calm.png') },
    { id: 'tired', label: 'Tired', image: require('@/assets/images/mood-tired.png') },
    { id: 'sad', label: 'Sad', image: require('@/assets/images/mood-sad.png') },
    { id: 'stressed', label: 'Stressed', image: require('@/assets/images/mood-stressed.png') },
    { id: 'okay', label: 'Okay', image: require('@/assets/images/mood-okay.png') },
];