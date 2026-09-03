import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ArrowRight, Check, Droplets, Heart, Leaf, Moon, PersonStanding, RefreshCw, Sparkles, Wind } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';
import { generateGardenPlan, getGuidedActivityConfig, isGuidedGardenTask, type GardenTask, type GardenTaskCategory } from '@/app/lib/garden-plan';
import { GardenerBubble } from '@/components/gardener-bubble';
import { useCareResponses } from './care-responses';
import { DEFAULT_GARDENER_ID, fetchSelectedGardenerId, getGardenerById, type GardenerId } from '@/app/lib/gardener';
import { fetchProfileFields } from '@/app/lib/profile';

const taskIcons: Record<GardenTaskCategory, typeof Droplets> = {
  calm: Wind,
  connection: Heart,
  hydration: Droplets,
  movement: PersonStanding,
  rest: Moon,
  reflection: Leaf,
  breathing: Wind,
  stretching: PersonStanding,
  affirmations: Heart,
  meditation: Moon,
};

const taskIconColors: Record<GardenTaskCategory, string> = {
  calm: '#5B7471',
  connection: '#B56576',
  hydration: '#2F88C7',
  movement: '#607950',
  rest: '#756B9B',
  reflection: '#6F875F',
  breathing: '#5B7471',
  stretching: '#B56576',
  affirmations: '#B56576',
  meditation: '#756B9B',
};

const MINIMUM_LOADING_DURATION_MS = 5000;

export default function Agent() {
  const {
    responses,
    gardenPlan,
    careDate,
    setGardenPlan,
    toggleTaskCompletion,
    ensureCurrentDay,
    simulateNextDayForDevelopment,
  } = useCareResponses();
  const plan = gardenPlan;
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [selectedGardenerId, setSelectedGardenerId] = useState<GardenerId>(DEFAULT_GARDENER_ID);
  const pulse = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);
  const generationId = useRef(0);
  const minimumLoadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveMinimumLoadingTimer = useRef<(() => void) | null>(null);
  const latestCareDate = useRef(careDate);
  latestCareDate.current = careDate;

  const clearMinimumLoadingTimer = useCallback(() => {
    if (minimumLoadingTimer.current) {
      clearTimeout(minimumLoadingTimer.current);
      minimumLoadingTimer.current = null;
    }

    resolveMinimumLoadingTimer.current?.();
    resolveMinimumLoadingTimer.current = null;
  }, []);

  const waitForMinimumLoadingDuration = useCallback((loadingStartedAt: number) => {
    const elapsed = Date.now() - loadingStartedAt;
    const remaining = MINIMUM_LOADING_DURATION_MS - elapsed;

    if (remaining <= 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const finishWaiting = () => {
        minimumLoadingTimer.current = null;
        resolveMinimumLoadingTimer.current = null;
        resolve();
      };

      resolveMinimumLoadingTimer.current = finishWaiting;
      minimumLoadingTimer.current = setTimeout(finishWaiting, remaining);
    });
  }, []);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      generationId.current += 1;
      clearMinimumLoadingTimer();
    };
  }, [clearMinimumLoadingTimer]);

  const createPlan = useCallback(async () => {
    clearMinimumLoadingTimer();
    const currentGenerationId = generationId.current + 1;
    generationId.current = currentGenerationId;
    const loadingStartedAt = Date.now();
    const planDate = careDate;

    setIsGenerating(true);
    setError(null);

    try {
      const nextPlan = await generateGardenPlan(responses);
      if (
        !isMounted.current ||
        currentGenerationId !== generationId.current ||
        planDate !== latestCareDate.current
      ) {
        return;
      }

      await waitForMinimumLoadingDuration(loadingStartedAt);
      if (
        !isMounted.current ||
        currentGenerationId !== generationId.current ||
        planDate !== latestCareDate.current
      ) {
        return;
      }

      setGardenPlan(nextPlan);
    } catch (caughtError) {
      if (
        !isMounted.current ||
        currentGenerationId !== generationId.current ||
        planDate !== latestCareDate.current
      ) {
        return;
      }

      console.warn('Unable to create a Rooted Garden Plan.', caughtError);
      setError('We could not create your plan just yet.');
    } finally {
      if (
        isMounted.current &&
        currentGenerationId === generationId.current &&
        planDate === latestCareDate.current
      ) {
        setIsGenerating(false);
      }
    }
  }, [careDate, clearMinimumLoadingTimer, responses, setGardenPlan, waitForMinimumLoadingDuration]);

  useEffect(() => {
    if (plan) {
      setIsGenerating(false);
      return;
    }

    if (!responses.emotion || responses.sleepHours === null) {
      generationId.current += 1;
      clearMinimumLoadingTimer();
      setIsGenerating(false);
      router.replace('/care');
      return;
    }

    void createPlan();
  }, [clearMinimumLoadingTimer, createPlan, plan, responses.emotion, responses.sleepHours]);

  useFocusEffect(
    useCallback(() => {
      if (ensureCurrentDay()) {
        router.replace('/care');
      }
    }, [ensureCurrentDay]),
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const [gardenerId, profileFields] = await Promise.all([
          fetchSelectedGardenerId(),
          fetchProfileFields(),
        ]);

        if (isActive) {
          setSelectedGardenerId(gardenerId);
          setProfileName(profileFields.name);
        }
      })();

      return () => {
        isActive = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!isGenerating) {
      pulse.stopAnimation();
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [isGenerating, pulse]);

  if (isGenerating) {
    return (
      <View style={appStyles.agentLoadingScreen}>
        <Animated.View
          style={[
            appStyles.agentLoadingImageWrapper,
            { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
          ]}
        >
          <View style={appStyles.agentLoadingImageClip}>
            <Image
              source={getGardenerById(selectedGardenerId).image}
              style={appStyles.agentLoadingImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>
        <Text style={appStyles.agentLoadingTitle}>Your Gardener is tending to your plan...</Text>
        <Text style={appStyles.agentLoadingText}>We are choosing a few gentle actions for the day ahead.</Text>
        <ActivityIndicator color="#899878" style={appStyles.agentSpinner} />
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={appStyles.agentErrorScreen}>
        <Image
          source={getGardenerById(selectedGardenerId).farmerImage}
          style={appStyles.agentErrorImage}
          resizeMode="contain"
        />
        <Text style={appStyles.agentErrorTitle}>Your Gardener needs another moment</Text>
        <Text style={appStyles.agentErrorText}>{error ?? 'We could not create your plan just yet.'}</Text>
        <Pressable
          style={appStyles.agentRetryButton}
          onPress={() => {
            if (ensureCurrentDay()) {
              router.replace('/care');
              return;
            }

            void createPlan();
          }}
        >
          <RefreshCw color="#37423D" size={18} strokeWidth={1.8} />
          <Text style={appStyles.agentRetryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const completedTaskCount = plan.tasks.filter((gardenTask) => gardenTask.completed).length;
  const progressPercentage = plan.tasks.length === 0 ? 0 : (completedTaskCount / plan.tasks.length) * 100;

  return (
    <View style={appStyles.agentPlanScreen}>
      <ScrollView contentContainerStyle={appStyles.agentPlanContent} showsVerticalScrollIndicator={false}>
        <GardenerBubble
          avatarSource={getGardenerById(selectedGardenerId).image}
          title={`Thank you for sharing${profileName ? `, ${profileName}` : ''}.`}
          message={plan.encouragement}
        />

        <View style={appStyles.agentPlanHeader}>
          <Sparkles color="#607950" size={24} strokeWidth={1.7} />
          <View>
            <Text style={appStyles.agentPlanTitle}>{plan.title}</Text>
            <Text style={appStyles.agentPlanSubtitle}>{plan.tasks.length} small ways to nourish you today</Text>
          </View>
        </View>

        <View style={appStyles.agentProgressSection}>
          <View style={appStyles.agentProgressLabels}>
            <Text style={appStyles.agentProgressLabel}>Plant Health</Text>
            <Text style={appStyles.agentProgressLabel}>{completedTaskCount}/{plan.tasks.length} activities</Text>
          </View>
          <View style={appStyles.agentProgressTrack}>
            <View style={[appStyles.agentProgressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        <View style={appStyles.agentTaskList}>
          {plan.tasks.map((gardenTask) => (
            <GardenTaskCard
              key={gardenTask.id}
              gardenTask={gardenTask}
              onToggle={() => { void toggleTaskCompletion(gardenTask.id); }}
              onStart={() => router.push({ pathname: '/care/session/[id]', params: { id: gardenTask.id } })}
            />
          ))}
        </View>
        {__DEV__ && (
          <Pressable
            style={appStyles.careDevDayButton}
            onPress={() => {
              simulateNextDayForDevelopment();
              router.replace('/care');
            }}
          >
            <Text style={appStyles.careDevDayButtonText}>Dev: simulate a new Care day</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function GardenTaskCard({
  gardenTask,
  onToggle,
  onStart,
}: {
  gardenTask: GardenTask;
  onToggle: () => void;
  onStart: () => void;
}) {
  const Icon = taskIcons[gardenTask.category];
  const iconColor = taskIconColors[gardenTask.category];
  const isGuided = isGuidedGardenTask(gardenTask);
  const guidedActivityConfig = isGuided ? getGuidedActivityConfig(gardenTask.category) : null;

  return (
    <View style={[appStyles.agentTaskCard, isGuided && appStyles.agentGuidedTaskCard]}>
      <View style={[appStyles.agentTaskIcon, { backgroundColor: `${iconColor}22` }]}>
        <Icon color={iconColor} size={21} strokeWidth={1.8} />
      </View>
      <View style={appStyles.agentTaskText}>
        <Text style={appStyles.agentTaskTitle}>{guidedActivityConfig?.title ?? gardenTask.title}</Text>
        <Text style={appStyles.agentTaskDescription}>{gardenTask.description}</Text>
        {isGuided && (
          <Text style={appStyles.agentGuidedTaskMeta}>
            Guided activity · {guidedActivityConfig?.durationMinutes} minutes
          </Text>
        )}
      </View>
      {isGuided ? (
        gardenTask.completed ? (
          <View
            style={[appStyles.agentTaskCheck, appStyles.agentTaskCheckCompleted]}
            accessibilityRole="image"
            accessibilityLabel={`${gardenTask.title} completed`}
          >
            <Check color="#FFFFFF" size={15} strokeWidth={2.4} />
          </View>
        ) : (
          <Pressable
            style={appStyles.agentGuidedStartButton}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel={`Start ${guidedActivityConfig?.title ?? gardenTask.title}`}
          >
            <Text style={appStyles.agentGuidedStartText}>Start</Text>
            <ArrowRight color="#37423D" size={15} strokeWidth={2} />
          </Pressable>
        )
      ) : (
        <Pressable
          style={[appStyles.agentTaskCheck, gardenTask.completed && appStyles.agentTaskCheckCompleted]}
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: gardenTask.completed }}
          accessibilityLabel={`Mark ${gardenTask.title} as ${gardenTask.completed ? 'incomplete' : 'complete'}`}
          hitSlop={8}
        >
          {gardenTask.completed && <Check color="#FFFFFF" size={15} strokeWidth={2.4} />}
        </Pressable>
      )}
    </View>
  );
}
