import { Text, View, Pressable, Image } from 'react-native';
import { appStyles } from '@/styles/styles';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from "expo-router";
import { Minus, Plus, ArrowRight } from 'lucide-react-native';
import { type CareEmotion, useCareResponses } from './care-responses';
import { MOOD_OPTIONS } from '@/app/lib/moods';
import { fetchProfileFields } from '@/app/lib/profile';
import { DEFAULT_GARDENER_ID, fetchSelectedGardenerId, getGardenerById, type GardenerId } from '@/app/lib/gardener';

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
  const [profileName, setProfileName] = useState('');
  const [selectedGardenerId, setSelectedGardenerId] = useState<GardenerId>(DEFAULT_GARDENER_ID);
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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const [profileFields, gardenerId] = await Promise.all([
          fetchProfileFields(),
          fetchSelectedGardenerId(),
        ]);
        if (isActive) {
          setProfileName(profileFields.name);
          setSelectedGardenerId(gardenerId);
        }
      })();

      return () => {
        isActive = false;
      };
    }, []),
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
            Hello{profileName ? <Text style={appStyles.careGreetingName}> {profileName}</Text> : ''}, how are you feeling today?
          </Text>
        </View>
        <View style={appStyles.careHeroImageWrapper}>
          <Image
            source={getGardenerById(selectedGardenerId).farmerImage}
            style={[
              appStyles.careIllustration,
              { transform: [{ translateX: getGardenerById(selectedGardenerId).farmerIllustrationOffsetX }] },
            ]}
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