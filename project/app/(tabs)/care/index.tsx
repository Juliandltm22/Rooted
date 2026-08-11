import { Text, View, Pressable, Image } from 'react-native';
import { appStyles } from '@/styles/styles';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react-native';

 const MOOD_OPTIONS = [
  {
    id: 'great',
    label: 'Great',
    image: require('@/assets/images/mood-great.png'),
  },
  {
    id: 'calm',
    label: 'Calm',
    image: require('@/assets/images/mood-calm.png'),
  },
  {
    id: 'tired',
    label: 'Tired',
    image: require('@/assets/images/mood-tired.png'),
  },
  {
    id: 'sad',
    label: 'Sad',
    image: require('@/assets/images/mood-sad.png'),
  },
  {
    id: 'stressed',
    label: 'Stressed',
    image: require('@/assets/images/mood-stressed.png'),
  },
  {
    id: 'okay',
    label: 'Okay',
    image: require('@/assets/images/mood-okay.png'),
  },
];

export default function Care() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sleepHours, setSleepHours] = useState(6);

  const decreaseSleep = () => setSleepHours((prev) => Math.max(0, prev - .5));
  const increaseSleep = () => setSleepHours((prev) => Math.min(24, prev + .5));
  const sleepLabel = sleepHours > 1 ? 'hours' : 'hour';

  return (
    <View style={appStyles.backgroundContainer}>
      {/* Hero Section */}
      <View style={appStyles.careHero}>
        <View style={appStyles.careHeroText}>
          <Text style={appStyles.careGreeting}>
            Hello <Text style={appStyles.careGreetingName}>Julian</Text>, how are you feeling today?
          </Text>
        </View>
        <View style={appStyles.careHeroImageWrapper}>
          <Image
            source={require('@/assets/images/farmer-respira.png')}
            style={appStyles.careIllustration}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Mood Section */}
      <View style={appStyles.moodContainer}>
        <Text style={appStyles.sectionLabel}>{"I'm feeling..."}</Text>
        <View style={appStyles.moodGrid}>
          {MOOD_OPTIONS.map((mood) => (
            <Pressable
              key={mood.id}
              style={[
                appStyles.moodOption,
                selectedMood === mood.id && appStyles.moodOptionSelected,
              ]}
              onPress={() => setSelectedMood(mood.id)}
            >
              <Image
                source={mood.image}
                style={appStyles.moodImage}
                resizeMode="contain"
              />

              <Text style={[appStyles.bodyHeadline4, selectedMood === mood.id && { fontFamily: 'Harmattan-SemiBold' }]}>
                {mood.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

       {/* Sleep Section */}
        <View style={appStyles.sleepContainer}>
          <Text style={appStyles.sectionLabel}>I slept for...</Text>
          <View style={appStyles.sleepRow}>
            <Pressable style={appStyles.sleepButton} onPress={decreaseSleep}>
              <Minus color="#37423D" size={20} strokeWidth={1.5} />
            </Pressable>

            <View style={appStyles.sleepHoursWrapper}>
              <Text style={appStyles.sleepHoursText}>
                {sleepHours} {sleepLabel}
              </Text>
            </View>

            <Pressable style={appStyles.sleepButton} onPress={increaseSleep}>
              <Plus color="#37423D" size={20} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>
    </View>
  );
}
