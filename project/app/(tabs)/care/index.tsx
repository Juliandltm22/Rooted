import { Text, View, Pressable, Image } from 'react-native';
import { appStyles } from '@/styles/styles';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from "expo-router";
import { Minus, Plus, ArrowRight } from 'lucide-react-native';
import { type CareEmotion, useCareResponses } from './care-responses';

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
  const {
    responses,
    gardenPlan,
    setEmotion,
    setSleepHours,
    ensureCurrentDay,
    simulateNextDayForDevelopment,
  } = useCareResponses();
  const [isContinuing, setIsContinuing] = useState(false);
  const { emotion: selectedMood, sleepHours } = responses;

  useFocusEffect(
    useCallback(() => {
      setIsContinuing(false);
      const startedNewDay = ensureCurrentDay();

      if (!startedNewDay && gardenPlan) {
        router.replace('/care/agent');
      }
    }, [ensureCurrentDay, gardenPlan]),
  );

  const decreaseSleep = () => setSleepHours(Math.max(0, (sleepHours ?? 8) - .5));
  const increaseSleep = () => setSleepHours(Math.min(24, (sleepHours ?? 8) + .5));
  const sleepLabel = sleepHours === 1 ? 'hour' : 'hours';
  const isNextDisabled = !selectedMood || sleepHours === null || isContinuing;

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
              onPress={() => setEmotion(mood.id as CareEmotion)}
            >
              <Image
                source={mood.image}
                style={appStyles.moodImage}
                resizeMode="contain"
              />

              <Text style={[appStyles.moodLabel, selectedMood === mood.id && { fontFamily: 'Harmattan-SemiBold' }]}>
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
                {sleepHours === null ? 'Select hours' : `${sleepHours} ${sleepLabel}`}
              </Text>
            </View>

            <Pressable style={appStyles.sleepButton} onPress={increaseSleep}>
              <Plus color="#37423D" size={20} strokeWidth={1.5} />
            </Pressable>
          </View>
      </View>

      {/* Next Button */}
      <View style={appStyles.nextContainer}>
        <Pressable
          style={[
            appStyles.nextButton,
            isNextDisabled && appStyles.nextButtonDisabled,
          ]}
          disabled={isNextDisabled}
          onPress={() => {
            if (ensureCurrentDay()) {
              setIsContinuing(false);
              return;
            }

            setIsContinuing(true);
            router.push('/care/prompt')
          }}
        >
          <Text style={appStyles.nextButtonText}>Tell me more</Text>
          <ArrowRight color="#37423D" size={18} strokeWidth={1.8} />
        </Pressable>
        {__DEV__ && (
          <Pressable style={appStyles.careDevDayButton} onPress={simulateNextDayForDevelopment}>
            {/* <Text style={appStyles.careDevDayButtonText}>Dev: simulate a new Care day</Text> */}
          </Pressable>
        )}
      </View>
    </View>
  );
}
