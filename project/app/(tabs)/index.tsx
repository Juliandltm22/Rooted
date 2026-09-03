import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { MY_PLANT_BACKGROUNDS, getPlantImage } from '@/app/lib/plant-assets';
import { claimGardenPlanCelebration, fetchPlantSnapshot, type PlantSnapshot } from '@/app/lib/plant-data';
import { getNextGrowthThreshold, getPlantStage } from '@/app/lib/plant-growth';
import { getApproximateCoordinates } from '@/app/lib/plant-location';
import {
  getPlantTimeOfDay,
  type ApproximateCoordinates,
  type PlantTimeOfDay,
} from '@/app/lib/plant-time';
import { getLocalDateKey } from '@/app/lib/local-date';
import { supabase } from '@/app/lib/supabase';
import { PlantSparkles } from '@/components/plant-sparkles';
import { appStyles } from '@/styles/styles';

const CLOCK_REFRESH_INTERVAL_MS = 60_000;

export default function MyPlant() {
  const [snapshot, setSnapshot] = useState<PlantSnapshot | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<PlantTimeOfDay>(() => getPlantTimeOfDay());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [sparklePlayKey, setSparklePlayKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let coordinates: ApproximateCoordinates | null = null;

      if (refreshKey > 0) {
        setSnapshot(null);
      }

      const refreshClock = () => {
        if (isActive) {
          setTimeOfDay(getPlantTimeOfDay(new Date(), coordinates));
        }
      };

      const loadPlant = async () => {
        setIsLoading(true);
        setError(null);
        refreshClock();

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (!isActive) {
          return;
        }

        if (userError || !userData.user) {
          setIsSignedIn(false);
          setIsLoading(false);
          return;
        }

        setIsSignedIn(true);

        try {
          const [nextCoordinates, nextSnapshot] = await Promise.all([
            getApproximateCoordinates(),
            fetchPlantSnapshot(),
          ]);
          coordinates = nextCoordinates;

          if (!isActive) {
            return;
          }

          setSnapshot(nextSnapshot);
          refreshClock();

          const shouldCelebrate = await claimGardenPlanCelebration(getLocalDateKey());
          if (isActive && shouldCelebrate) {
            setSparklePlayKey((currentKey) => currentKey + 1);
          }
        } catch (caughtError) {
          console.warn('Unable to load My Plant.', caughtError);
          if (isActive) {
            setError('Your plant could not sync just yet. Please try again.');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      void loadPlant();
      const clockInterval = setInterval(refreshClock, CLOCK_REFRESH_INTERVAL_MS);

      return () => {
        isActive = false;
        clearInterval(clockInterval);
      };
    }, [refreshKey]),
  );

  if (isSignedIn === false) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const isNight = timeOfDay === 'night';
  const stage = snapshot ? getPlantStage(snapshot.completedTaskCount) : 0;
  const nextThreshold = snapshot ? getNextGrowthThreshold(snapshot.completedTaskCount) : null;
  const foregroundColor = isNight ? '#FCF9ED' : '#37423D';

  return (
    <ImageBackground
      source={MY_PLANT_BACKGROUNDS[timeOfDay]}
      style={appStyles.myPlantBackground}
      resizeMode="cover"
    >
      <StatusBar style={isNight ? 'light' : 'dark'} />
      <SafeAreaView edges={['top']} style={appStyles.myPlantSafeArea}>
        <View style={appStyles.myPlantHeader}>
          <Text style={[appStyles.myPlantTitle, { color: foregroundColor }]}>My Plant</Text>
          <Text style={[appStyles.myPlantSubtitle, { color: foregroundColor }]}>Every little act of care helps it grow.</Text>

          {snapshot && (
            <View style={appStyles.myPlantProgressPill}>
              {nextThreshold === null ? (
                <>
                  <Text style={appStyles.myPlantProgressTitle}>Fully grown 🌸</Text>
                  <Text style={appStyles.myPlantProgressText}>
                    You’ve helped your cactus reach its final stage.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={appStyles.myPlantProgressTitle}>
                    {snapshot.completedTaskCount} / {nextThreshold} acts of care
                  </Text>
                  <Text style={appStyles.myPlantProgressText}>
                    {nextThreshold - snapshot.completedTaskCount} more until your cactus grows.
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {isLoading && !snapshot ? (
          <View style={appStyles.myPlantCenteredState}>
            <ActivityIndicator size="large" color={foregroundColor} />
          </View>
        ) : error && !snapshot ? (
          <View style={appStyles.myPlantCenteredState}>
            <View style={appStyles.myPlantErrorCard}>
              <Text style={appStyles.myPlantErrorTitle}>Your plant needs another moment</Text>
              <Text style={appStyles.myPlantErrorText}>{error}</Text>
              <Pressable
                style={appStyles.agentRetryButton}
                onPress={() => setRefreshKey((currentKey) => currentKey + 1)}
                accessibilityRole="button"
              >
                <RefreshCw color="#37423D" size={18} strokeWidth={1.8} />
                <Text style={appStyles.agentRetryText}>Try again</Text>
              </Pressable>
            </View>
          </View>
        ) : snapshot ? (
          <View style={appStyles.myPlantStage}>
            <View style={appStyles.myPlantVisual}>
              <PlantSparkles playKey={sparklePlayKey} />
              <Image
                source={getPlantImage(snapshot.potColor, stage)}
                style={[
                  appStyles.myPlantImage,
                  stage === 4 && appStyles.myPlantImageStageFour,
                ]}
                resizeMode="contain"
                accessibilityLabel={`${snapshot.potColor} pot cactus at growth stage ${stage}`}
              />
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </ImageBackground>
  );
}
