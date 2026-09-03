import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { ArrowLeft, Check, Heart, Moon, Pause, PersonStanding, Play, Sparkles, Volume2, VolumeX, Wind } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';
import { getAmbientAudioUrl, getGuidedVoiceAudioUrl } from '@/app/lib/guided-audio';
import { createGuidedSessionPlan, getBreathingPhase, type GuidedSessionCue } from '@/app/lib/guided-session';
import { useGuidedNavigationGuard } from '@/app/lib/use-guided-navigation-guard';
import { useGuidedSession } from '@/app/lib/use-guided-session';
import { useCareResponses } from '../care-responses';

const activityIcons = {
  breathing: Wind,
  stretching: PersonStanding,
  affirmations: Heart,
  meditation: Moon,
};

const activityColors = {
  breathing: '#7D9BC4',
  stretching: '#D59CB6',
  affirmations: '#7D9BC4',
  meditation: '#E3B775',
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export default function GuidedSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    responses,
    gardenPlan,
    careDate,
    completeTask,
    ensureCurrentDay,
  } = useCareResponses();
  const task = gardenPlan?.tasks.find((gardenTask) => gardenTask.id === id);
  const sessionPlan = useMemo(
    () => (task ? createGuidedSessionPlan(task, responses) : null),
    [responses, task],
  );
  const sessionPlanRef = useRef(sessionPlan);
  const sessionDateRef = useRef(careDate);
  const allowNavigationRef = useRef<() => void>(() => undefined);
  const playedCueIdsRef = useRef(new Set<string>());
  const voiceEnabledRef = useRef(true);
  const audioPlaybackGenerationRef = useRef(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(sessionPlan?.musicRecommended ?? false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const voicePlayer = useAudioPlayer(null, { downloadFirst: true, keepAudioSessionActive: true });
  const musicPlayer = useAudioPlayer(null, { downloadFirst: true, keepAudioSessionActive: true });

  sessionPlanRef.current = sessionPlan;
  voiceEnabledRef.current = voiceEnabled;

  const handleSessionComplete = useCallback(() => {
    const currentPlan = sessionPlanRef.current;
    if (!currentPlan || sessionDateRef.current !== careDate || ensureCurrentDay()) {
      allowNavigationRef.current();
      router.replace('/care');
      return;
    }

    void completeTask(currentPlan.taskId).then((wasSaved) => {
      if (!wasSaved) {
        setAudioNotice('Your activity finished, but Plant Health could not sync. Please try again from your plan.');
      }
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, [careDate, completeTask, ensureCurrentDay]);

  const session = useGuidedSession({
    durationSeconds: sessionPlan?.durationSeconds ?? 120,
    onComplete: handleSessionComplete,
  });
  const sessionStatusRef = useRef(session.status);
  sessionStatusRef.current = session.status;

  const stopAudio = useCallback(() => {
    voicePlayer.pause();
    musicPlayer.pause();
  }, [musicPlayer, voicePlayer]);

  const cleanUpUnfinishedSession = useCallback(() => {
    audioPlaybackGenerationRef.current += 1;
    session.cancel();
    stopAudio();
  }, [session, stopAudio]);

  const navigationGuard = useGuidedNavigationGuard({
    isSessionUnfinished: session.status === 'running' || session.status === 'paused',
    onLeaveSession: cleanUpUnfinishedSession,
  });
  allowNavigationRef.current = navigationGuard.allowNextNavigation;

  useFocusEffect(
    useCallback(() => {
      if (ensureCurrentDay()) {
        allowNavigationRef.current();
        router.replace('/care');
      }
    }, [ensureCurrentDay]),
  );

  useEffect(() => {
    if (!sessionPlan || (task?.completed && session.status !== 'completed')) {
      allowNavigationRef.current();
      router.replace('/care/agent');
    }
  }, [session.status, sessionPlan, task?.completed]);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {
      setAudioNotice('Audio is unavailable right now. Your session can continue silently.');
    });
  }, []);

  useEffect(() => {
    if (session.status !== 'running' || !musicEnabled) {
      musicPlayer.pause();
      return;
    }

    const musicUrl = getAmbientAudioUrl();
    if (!musicUrl) {
      setAudioNotice('Ambient music is not configured, but your session can continue normally.');
      return;
    }

    try {
      musicPlayer.loop = true;
      musicPlayer.replace(musicUrl);
      musicPlayer.play();
    } catch {
      setAudioNotice('Ambient music could not play. Your session can continue normally.');
    }
  }, [musicEnabled, musicPlayer, session.status]);

  useEffect(() => {
    if (session.status === 'running' && voiceEnabled) {
      return;
    }

    voicePlayer.pause();
  }, [session.status, voiceEnabled, voicePlayer]);

  const playCue = useCallback(async (guidedCue: GuidedSessionCue) => {
    const currentPlan = sessionPlanRef.current;
    const playbackGeneration = audioPlaybackGenerationRef.current;
    if (!currentPlan) {
      return;
    }

    try {
      const audioUrl = await getGuidedVoiceAudioUrl(
        guidedCue.text,
        `guided-v1-${currentPlan.type}-${guidedCue.id}`,
      );

      if (
        playbackGeneration !== audioPlaybackGenerationRef.current ||
        !voiceEnabledRef.current ||
        sessionStatusRef.current !== 'running'
      ) {
        return;
      }

      voicePlayer.replace(audioUrl);
      voicePlayer.play();
    } catch {
      if (
        playbackGeneration === audioPlaybackGenerationRef.current &&
        sessionStatusRef.current === 'running'
      ) {
        setAudioNotice('Voice guidance is unavailable right now. You can continue with the on-screen prompts.');
      }
    }
  }, [voicePlayer]);

  useEffect(() => () => {
    audioPlaybackGenerationRef.current += 1;
    stopAudio();
  }, [stopAudio]);

  useEffect(() => {
    if (!sessionPlan || session.status !== 'running') {
      return;
    }

    const dueCues = sessionPlan.cues.filter((guidedCue) =>
      guidedCue.atSecond <= session.elapsedSeconds && !playedCueIdsRef.current.has(guidedCue.id),
    );

    dueCues.forEach((guidedCue) => {
      playedCueIdsRef.current.add(guidedCue.id);
      if (voiceEnabledRef.current) {
        void playCue(guidedCue);
      }
    });
  }, [playCue, session.elapsedSeconds, session.status, sessionPlan]);

  useEffect(() => {
    if (session.status !== 'completed') {
      return;
    }

    stopAudio();
  }, [session.status, stopAudio]);

  if (!sessionPlan) {
    return null;
  }

  const ActivityIcon = activityIcons[sessionPlan.type];
  const activityColor = activityColors[sessionPlan.type];
  const breathingPhase = sessionPlan.type === 'breathing'
    ? getBreathingPhase(session.elapsedSeconds)
    : null;
  const isReady = session.status === 'ready';
  const isPaused = session.status === 'paused';
  const isCompleted = session.status === 'completed';

  const toggleVoice = () => {
    setVoiceEnabled((isEnabled) => !isEnabled);
  };

  const toggleMusic = () => {
    setMusicEnabled((isEnabled) => !isEnabled);
  };

  const startSession = () => {
    if (ensureCurrentDay()) {
      allowNavigationRef.current();
      router.replace('/care');
      return;
    }

    session.start();
  };

  return (
    <View style={appStyles.guidedSessionScreen}>
      <View style={appStyles.guidedSessionHeader}>
        <Pressable
          style={appStyles.guidedSessionBackButton}
          onPress={() => navigationGuard.requestExit(() => router.back())}
          accessibilityRole="button"
          accessibilityLabel="Leave guided session"
          hitSlop={10}
        >
          <ArrowLeft color="#37423D" size={22} strokeWidth={1.8} />
        </Pressable>
        <Text style={appStyles.guidedSessionDuration}>{sessionPlan.durationMinutes} MINUTES</Text>
        <View style={appStyles.guidedSessionHeaderSpacer} />
      </View>

      {isCompleted ? (
        <View style={appStyles.guidedCompletionContent}>
          <View style={[appStyles.guidedActivityOrb, { backgroundColor: `${activityColor}33` }]}>
            <Check color="#37423D" size={64} strokeWidth={1.6} />
          </View>
          <Text style={appStyles.guidedCompletionTitle}>A little care goes a long way.</Text>
          <Text style={appStyles.guidedCompletionText}>
            Your {sessionPlan.title.toLowerCase()} is complete and your Plant Health has been updated.
          </Text>
          <Pressable
            style={appStyles.guidedPrimaryButton}
            onPress={() => router.replace('/care/agent')}
            accessibilityRole="button"
            accessibilityLabel="Return to today’s Garden Plan"
          >
            <Text style={appStyles.guidedPrimaryButtonText}>Back to Garden</Text>
          </Pressable>
        </View>
      ) : (
        <View style={appStyles.guidedSessionContent}>
          <Text style={appStyles.guidedSessionTitle}>{sessionPlan.title}</Text>
          <Text style={appStyles.guidedSessionDescription}>
            {isReady ? sessionPlan.readyMessage : sessionPlan.description}
          </Text>

          <View style={[appStyles.guidedActivityOrb, { backgroundColor: `${activityColor}33` }]}>
            <ActivityIcon color="#37423D" size={82} strokeWidth={1.2} />
          </View>

          {!isReady && (
            <>
              <Text style={appStyles.guidedTimer}>{formatTime(session.remainingSeconds)}</Text>
              {breathingPhase ? (
                <View style={appStyles.guidedPhaseBlock}>
                  <Text style={appStyles.guidedPhaseTitle}>{breathingPhase.label}</Text>
                  <Text style={appStyles.guidedPhaseText}>{breathingPhase.detail}</Text>
                </View>
              ) : (
                <Text style={appStyles.guidedActivePrompt}>
                  {isPaused ? 'Take your time. Resume whenever you are ready.' : 'There is no need to rush this moment.'}
                </Text>
              )}
            </>
          )}

          {sessionPlan.safetyNote && isReady && (
            <Text style={appStyles.guidedSafetyNote}>{sessionPlan.safetyNote}</Text>
          )}

          <View style={appStyles.guidedAudioControls}>
            <Pressable
              style={[appStyles.guidedAudioControl, !voiceEnabled && appStyles.guidedAudioControlMuted]}
              onPress={toggleVoice}
              accessibilityRole="switch"
              accessibilityState={{ checked: voiceEnabled }}
              accessibilityLabel={`Voice guidance ${voiceEnabled ? 'on' : 'off'}`}
            >
              {voiceEnabled ? <Volume2 color="#37423D" size={18} /> : <VolumeX color="#6B716D" size={18} />}
              <Text style={appStyles.guidedAudioControlText}>Voice {voiceEnabled ? 'on' : 'off'}</Text>
            </Pressable>
            <Pressable
              style={[appStyles.guidedAudioControl, !musicEnabled && appStyles.guidedAudioControlMuted]}
              onPress={toggleMusic}
              accessibilityRole="switch"
              accessibilityState={{ checked: musicEnabled }}
              accessibilityLabel={`Ambient music ${musicEnabled ? 'on' : 'off'}`}
            >
              {musicEnabled ? <Sparkles color="#37423D" size={18} /> : <VolumeX color="#6B716D" size={18} />}
              <Text style={appStyles.guidedAudioControlText}>Music {musicEnabled ? 'on' : 'off'}</Text>
            </Pressable>
          </View>

          {audioNotice && <Text style={appStyles.guidedAudioNotice}>{audioNotice}</Text>}

          {isReady ? (
            <Pressable
              style={appStyles.guidedPrimaryButton}
              onPress={startSession}
              accessibilityRole="button"
              accessibilityLabel={`Start ${sessionPlan.title}`}
            >
              <Play color="#37423D" fill="#37423D" size={18} strokeWidth={1.8} />
              <Text style={appStyles.guidedPrimaryButtonText}>Begin session</Text>
            </Pressable>
          ) : (
            <Pressable
              style={appStyles.guidedPauseButton}
              onPress={isPaused ? session.resume : session.pause}
              accessibilityRole="button"
              accessibilityLabel={isPaused ? 'Resume session' : 'Pause session'}
            >
              {isPaused ? <Play color="#37423D" fill="#37423D" size={22} /> : <Pause color="#37423D" size={22} />}
              <Text style={appStyles.guidedPauseButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </Pressable>
          )}
        </View>
      )}

      <Modal
        transparent
        visible={navigationGuard.isExitConfirmationVisible}
        animationType="fade"
        onRequestClose={navigationGuard.stayInSession}
      >
        <View style={appStyles.guidedExitOverlay}>
          <View style={appStyles.guidedExitCard} accessibilityViewIsModal>
            <Text style={appStyles.guidedExitTitle}>Leave session?</Text>
            <Text style={appStyles.guidedExitText}>Your progress will not be completed.</Text>
            <View style={appStyles.guidedExitActions}>
              <Pressable
                style={appStyles.guidedStayButton}
                onPress={navigationGuard.stayInSession}
                accessibilityRole="button"
              >
                <Text style={appStyles.guidedStayButtonText}>Stay</Text>
              </Pressable>
              <Pressable
                style={appStyles.guidedLeaveButton}
                onPress={navigationGuard.leaveSession}
                accessibilityRole="button"
              >
                <Text style={appStyles.guidedLeaveButtonText}>Leave</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
