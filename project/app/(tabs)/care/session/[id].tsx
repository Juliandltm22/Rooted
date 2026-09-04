import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  setAudioModeAsync,
  type AudioSource,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { ArrowLeft, Check, Heart, Moon, Pause, PersonStanding, Play, Sparkles, Volume2, VolumeX, Wind } from 'lucide-react-native';
import { appStyles } from '@/styles/styles';
import { getAmbientAudioSource } from '@/app/lib/guided-audio';
import {
  getActiveDisplayCue,
  getBreathingPhase,
  type VoiceCue,
} from '@/app/lib/activity-scripts';
import { speakGuidedCue, stopGuidedSpeech } from '@/app/lib/device-speech';
import { createGuidedSessionPlan } from '@/app/lib/guided-session';
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

function safePause(player: { pause: () => void }) {
  try {
    player.pause();
  } catch {
    // No active playback to pause; nothing to clean up.
  }
}

export default function GuidedSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    gardenPlan,
    careDate,
    completeTask,
    ensureCurrentDay,
  } = useCareResponses();
  const task = gardenPlan?.tasks.find((gardenTask) => gardenTask.id === id);
  const sessionPlan = useMemo(
    () => (task ? createGuidedSessionPlan(task) : null),
    [task],
  );
  const ambientAudioSource = useMemo(() => getAmbientAudioSource(), []);
  const sessionPlanRef = useRef(sessionPlan);
  const sessionDateRef = useRef(careDate);
  const allowNavigationRef = useRef<() => void>(() => undefined);
  const playedCueKeysRef = useRef(new Set<string>());
  const voiceAvailableRef = useRef(true);
  const voiceEnabledRef = useRef(true);
  const speechGenerationRef = useRef(0);
  const lastMusicPlaybackErrorRef = useRef<string | null>(null);
  const musicSourceLoadedRef = useRef(false);
  const audioLifecycleActiveRef = useRef(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(sessionPlan?.musicRecommended ?? false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const musicPlayer = useAudioPlayer(null, { downloadFirst: true, keepAudioSessionActive: true });
  const musicStatus = useAudioPlayerStatus(musicPlayer);

  useEffect(() => {
    sessionPlanRef.current = sessionPlan;
  }, [sessionPlan]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

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
  useEffect(() => {
    sessionStatusRef.current = session.status;
  }, [session.status]);

  const stopAudio = useCallback(() => {
    speechGenerationRef.current += 1;
    void stopGuidedSpeech();
    safePause(musicPlayer);
  }, [musicPlayer]);

  const cleanUpAudio = useCallback(() => {
    audioLifecycleActiveRef.current = false;
    stopAudio();
  }, [stopAudio]);

  const cleanUpUnfinishedSession = useCallback(() => {
    session.cancel();
    cleanUpAudio();
  }, [cleanUpAudio, session]);

  const navigationGuard = useGuidedNavigationGuard({
    isSessionUnfinished: session.status === 'running' || session.status === 'paused',
    onLeaveSession: cleanUpUnfinishedSession,
  });
  useEffect(() => {
    allowNavigationRef.current = navigationGuard.allowNextNavigation;
  }, [navigationGuard.allowNextNavigation]);

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
      console.warn('[guided-session] Expo Audio could not configure the playback session.');
      setAudioNotice('Audio is unavailable right now. Your session can continue silently.');
    });
  }, []);

  useEffect(() => {
    if (session.status !== 'running' || !musicEnabled) {
      safePause(musicPlayer);
      return;
    }

    if (!ambientAudioSource) {
      return;
    }

    try {
      if (musicSourceLoadedRef.current) {
        resumeAudioPlayer(musicPlayer, 0.22);
      } else {
        startAudioPlayer(musicPlayer, ambientAudioSource, { loop: true, volume: 0.22 });
        musicSourceLoadedRef.current = true;
      }
    } catch (error) {
      console.warn('[guided-session] Ambient audio playback failed.', error);
    }
  }, [ambientAudioSource, musicEnabled, musicPlayer, session.status]);

  useEffect(() => {
    if (session.status === 'running' && voiceEnabled) {
      return;
    }

    speechGenerationRef.current += 1;
    void stopGuidedSpeech();
    if (audioLifecycleActiveRef.current) {
      safeSetPlayerVolume(musicPlayer, 0.22);
    }
  }, [musicPlayer, session.status, voiceEnabled]);

  const markVoiceUnavailable = useCallback((cue: VoiceCue, error: unknown) => {
    voiceAvailableRef.current = false;
    setVoiceUnavailable(true);
    console.warn(`[guided-session] Device TTS failed for cue "${cue.id}".`, error);
  }, []);

  useEffect(() => {
    if (!musicStatus.error) {
      lastMusicPlaybackErrorRef.current = null;
      return;
    }
    if (lastMusicPlaybackErrorRef.current === musicStatus.error) {
      return;
    }

    lastMusicPlaybackErrorRef.current = musicStatus.error;
    console.warn('[guided-session] Ambient audio playback failed.', musicStatus.error);
  }, [musicStatus.error]);

  const playCue = useCallback(async (guidedCue: VoiceCue) => {
    const speechGeneration = ++speechGenerationRef.current;
    if (!voiceAvailableRef.current) {
      return;
    }

    try {
      await stopGuidedSpeech();

      if (
        speechGeneration !== speechGenerationRef.current ||
        !audioLifecycleActiveRef.current ||
        !voiceEnabledRef.current ||
        sessionStatusRef.current !== 'running'
      ) {
        return;
      }

      if (musicEnabled) {
        safeSetPlayerVolume(musicPlayer, 0.12);
      }
      await speakGuidedCue(guidedCue.text);
    } catch (error) {
      if (speechGeneration === speechGenerationRef.current) {
        markVoiceUnavailable(guidedCue, error);
      }
    } finally {
      if (
        speechGeneration === speechGenerationRef.current &&
        audioLifecycleActiveRef.current &&
        musicEnabled
      ) {
        safeSetPlayerVolume(musicPlayer, 0.22);
      }
    }
  }, [markVoiceUnavailable, musicEnabled, musicPlayer]);

  useEffect(() => {
    audioLifecycleActiveRef.current = true;
    return () => {
      cleanUpAudio();
    };
  }, [cleanUpAudio]);

  useEffect(() => {
    if (!sessionPlan || session.status !== 'running') {
      return;
    }

    const elapsedMs = session.elapsedSeconds * 1000;
    const dueCues = sessionPlan.voiceCues.filter((guidedCue) => {
      const cueKey = `${guidedCue.id}@${guidedCue.atMs}`;
      return guidedCue.atMs <= elapsedMs && !playedCueKeysRef.current.has(cueKey);
    });

    dueCues.forEach((guidedCue) => {
      playedCueKeysRef.current.add(`${guidedCue.id}@${guidedCue.atMs}`);
    });

    // If the app skipped across several cue times, only play the newest one.
    // All earlier cues stay marked as handled and are never replayed later.
    const currentCue = dueCues.at(-1);
    if (currentCue && voiceEnabledRef.current && voiceAvailableRef.current) {
      void playCue(currentCue);
    }
  }, [playCue, session.elapsedSeconds, session.status, sessionPlan]);

  useEffect(() => {
    if (session.status !== 'completed') {
      return;
    }

    cleanUpAudio();
  }, [cleanUpAudio, session.status]);

  if (!sessionPlan) {
    return null;
  }

  const ActivityIcon = activityIcons[sessionPlan.type];
  const activityColor = activityColors[sessionPlan.type];
  const elapsedMs = session.elapsedSeconds * 1000;
  const breathingPhase = sessionPlan.type === 'breathing'
    ? getBreathingPhase(elapsedMs)
    : null;
  const activeDisplayCue = getActiveDisplayCue(sessionPlan, elapsedMs);
  const hasVoiceGuidance = sessionPlan.voiceCues.length > 0;
  const isReady = session.status === 'ready';
  const isPaused = session.status === 'paused';
  const isCompleted = session.status === 'completed';
  const availabilityNotice = session.status === 'running'
    ? voiceEnabled && voiceUnavailable
      ? 'Voice guidance is unavailable right now. You can continue with the on-screen prompts.'
      : musicEnabled && (!ambientAudioSource || Boolean(musicStatus.error))
        ? 'Ambient music is unavailable right now. Your session can continue normally.'
        : null
    : null;

  const toggleVoice = () => {
    const nextVoiceEnabled = !voiceEnabled;
    voiceEnabledRef.current = nextVoiceEnabled;
    if (!nextVoiceEnabled) {
      speechGenerationRef.current += 1;
      void stopGuidedSpeech();
      if (audioLifecycleActiveRef.current) {
        safeSetPlayerVolume(musicPlayer, 0.22);
      }
    }
    setVoiceEnabled(nextVoiceEnabled);
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
                <View style={appStyles.guidedPhaseBlock} accessibilityLiveRegion="polite">
                  <Text style={appStyles.guidedPhaseTitle}>{breathingPhase.label}</Text>
                  <Text style={appStyles.guidedPhaseCount}>{breathingPhase.count}</Text>
                </View>
              ) : activeDisplayCue ? (
                <View style={appStyles.guidedGuidanceBlock} accessibilityLiveRegion="polite">
                  {activeDisplayCue.label && (
                    <Text style={appStyles.guidedGuidanceLabel}>{activeDisplayCue.label}</Text>
                  )}
                  <Text
                    style={[
                      appStyles.guidedGuidanceText,
                      sessionPlan.type === 'affirmations' &&
                        activeDisplayCue.label === 'Repeat after me' &&
                        appStyles.guidedAffirmationText,
                    ]}
                  >
                    {activeDisplayCue.text}
                  </Text>
                </View>
              ) : null}
              {isPaused && (
                <Text style={appStyles.guidedPausedText}>Paused. Resume whenever you are ready.</Text>
              )}
            </>
          )}

          {sessionPlan.safetyNote && isReady && (
            <Text style={appStyles.guidedSafetyNote}>{sessionPlan.safetyNote}</Text>
          )}

          <View style={appStyles.guidedAudioControls}>
            {hasVoiceGuidance && (
              <Pressable
                style={[appStyles.guidedAudioControl, !voiceEnabled && appStyles.guidedAudioControlMuted]}
                onPress={toggleVoice}
                accessibilityRole="switch"
                accessibilityState={{ checked: voiceEnabled }}
                accessibilityLabel={`Voice guidance ${voiceEnabled ? 'on' : 'off'}`}
                accessibilityHint="Toggles spoken guidance without pausing the activity"
              >
                {voiceEnabled ? <Volume2 color="#37423D" size={18} /> : <VolumeX color="#6B716D" size={18} />}
                <Text style={appStyles.guidedAudioControlText}>Voice {voiceEnabled ? 'on' : 'off'}</Text>
              </Pressable>
            )}
            <Pressable
              style={[appStyles.guidedAudioControl, !musicEnabled && appStyles.guidedAudioControlMuted]}
              onPress={toggleMusic}
              accessibilityRole="switch"
              accessibilityState={{ checked: musicEnabled }}
              accessibilityLabel={`Ambient music ${musicEnabled ? 'on' : 'off'}`}
              accessibilityHint="Toggles ambient sound without affecting voice guidance"
            >
              {musicEnabled ? <Sparkles color="#37423D" size={18} /> : <VolumeX color="#6B716D" size={18} />}
              <Text style={appStyles.guidedAudioControlText}>Music {musicEnabled ? 'on' : 'off'}</Text>
            </Pressable>
          </View>

          {(audioNotice ?? availabilityNotice) && (
            <Text style={appStyles.guidedAudioNotice}>{audioNotice ?? availabilityNotice}</Text>
          )}

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

function startAudioPlayer(
  player: {
    loop: boolean;
    volume: number;
    replace: (source: AudioSource) => void;
    play: () => void;
  },
  source: AudioSource,
  { loop, volume }: { loop: boolean; volume: number },
) {
  player.loop = loop;
  player.volume = volume;
  player.replace(source);
  player.play();
}

function safeSetPlayerVolume(player: { volume: number }, volume: number) {
  try {
    player.volume = volume;
  } catch {
    // Expo Audio may release its native player before an async TTS callback settles.
  }
}

function resumeAudioPlayer(player: { loop: boolean; volume: number; play: () => void }, volume: number) {
  player.loop = true;
  player.volume = volume;
  player.play();
}
