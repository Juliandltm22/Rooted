import type { CareResponses } from '@/app/(tabs)/care/care-responses';
import {
  getGuidedActivityConfig,
  isGuidedGardenTask,
  type GardenTask,
  type GuidedActivityType,
} from './garden-plan';

export interface GuidedSessionCue {
  id: string;
  atSecond: number;
  text: string;
  cacheKey?: string;
}

export interface GuidedSessionPlan {
  taskId: string;
  type: GuidedActivityType;
  title: string;
  description: string;
  durationMinutes: number;
  durationSeconds: number;
  readyMessage: string;
  safetyNote?: string;
  musicRecommended: boolean;
  cues: GuidedSessionCue[];
}

export interface StretchInstruction {
  id: string;
  title: string;
  instruction: string;
}

export const GENTLE_STRETCH_LIBRARY: StretchInstruction[] = [
  {
    id: 'shoulder-rolls',
    title: 'Shoulder rolls',
    instruction: 'Let your arms rest. Slowly roll both shoulders backward, keeping the movement small and comfortable.',
  },
  {
    id: 'neck-shoulder-release',
    title: 'Neck and shoulder release',
    instruction: 'Relax your jaw, then gently lower one ear toward its shoulder. Keep both shoulders soft and switch sides when ready.',
  },
  {
    id: 'side-stretch',
    title: 'Gentle side stretch',
    instruction: 'Reach one arm overhead and lean just a little to the opposite side. Breathe, then change sides.',
  },
  {
    id: 'seated-twist',
    title: 'Easy seated twist',
    instruction: 'Sit tall and slowly turn your chest to one side without forcing the stretch. Return to center, then switch sides.',
  },
  {
    id: 'chest-opener',
    title: 'Chest and shoulder opener',
    instruction: 'Gently draw your shoulder blades toward one another. Keep your ribs soft and breathe comfortably.',
  },
  {
    id: 'wrist-forearm',
    title: 'Wrist and forearm stretch',
    instruction: 'Extend one arm, then use the other hand to guide the fingers back only until you feel a mild stretch. Switch hands.',
  },
];

const defaultAffirmations = [
  'I can meet this moment one gentle step at a time.',
  'I am allowed to slow down and care for myself.',
  'I have enough for this next small step.',
  'I can return to what matters with a little more ease.',
];

const overwhelmedAffirmations = [
  'I can take things one step at a time.',
  'I do not have to do everything at once.',
  'I am allowed to slow down.',
  'A small pause can be enough for this moment.',
];

const tiredAffirmations = [
  'I can be gentle with my energy today.',
  'Rest and small steps both count.',
  'I do not need to rush to be worthy.',
  'I can listen to what my body needs.',
];

const hopefulAffirmations = [
  'I can carry this good energy with care.',
  'I am capable of meeting today with warmth.',
  'I can make room for what feels meaningful.',
  'I am growing in my own steady way.',
];

function includesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word));
}

function getAffirmations({ emotion, sleepHours, additionalFeelings }: CareResponses) {
  const feelings = additionalFeelings.toLowerCase();

  if (emotion === 'stressed' || includesAny(feelings, ['anxious', 'worried', 'overwhelm', 'stress', 'nervous'])) {
    return overwhelmedAffirmations;
  }

  if (emotion === 'tired' || (sleepHours !== null && sleepHours < 6)) {
    return tiredAffirmations;
  }

  if (emotion === 'great') {
    return hopefulAffirmations;
  }

  return defaultAffirmations;
}

function cue(id: string, atSecond: number, text: string, cacheKey?: string): GuidedSessionCue {
  return { id, atSecond, text, cacheKey };
}

const BREATHING_PHASE_SECONDS = 4;


function getBreathingCues(durationSeconds: number): GuidedSessionCue[] {
  const phases = [
    { cacheKey: 'breathe-in', text: 'Breathe in slowly for four.' },
    { cacheKey: 'breathe-hold', text: 'Hold.' },
    { cacheKey: 'breathe-out', text: 'Now breathe out slowly for four.' },
    { cacheKey: 'breathe-hold', text: 'Hold.' },
  ];

  const cues: GuidedSessionCue[] = [];

  for (let second = 0; second < durationSeconds; second += BREATHING_PHASE_SECONDS) {
    const phase = phases[Math.floor(second / BREATHING_PHASE_SECONDS) % phases.length];
    const isIntro = second === 0;

    cues.push(cue(
      `breathe-${second}`,
      second,
      isIntro ? `Let’s begin Box Breathing. ${phase.text}` : phase.text,
      isIntro ? 'breathe-intro' : phase.cacheKey,
    ));
  }

  return cues;
}

function getStretchCues(durationSeconds: number): GuidedSessionCue[] {
  const stretchCount = Math.min(GENTLE_STRETCH_LIBRARY.length, Math.max(3, Math.floor(durationSeconds / 42)));
  const secondsPerStretch = Math.max(30, Math.floor(durationSeconds / stretchCount));

  return GENTLE_STRETCH_LIBRARY.slice(0, stretchCount).map((stretch, index) => cue(
    stretch.id,
    index * secondsPerStretch,
    index === 0
      ? `Start with ${stretch.title}. ${stretch.instruction} Stop if anything feels painful.`
      : `Now try ${stretch.title}. ${stretch.instruction}`,
  ));
}

function getAffirmationCues(durationSeconds: number, responses: CareResponses): GuidedSessionCue[] {
  const affirmations = getAffirmations(responses);
  const interval = Math.max(20, Math.floor((durationSeconds - 20) / affirmations.length));

  return affirmations.map((affirmation, index) => cue(`affirmation-${index}`, 8 + index * interval, affirmation));
}

function getMeditationCues(durationSeconds: number): GuidedSessionCue[] {
  return [
    cue('meditation-ready', 0, 'Find a comfortable position. There is nothing you need to fix right now.'),
    cue('meditation-shoulders', Math.min(25, Math.floor(durationSeconds * 0.2)), 'Let your shoulders soften.'),
    cue('meditation-breath', Math.min(60, Math.floor(durationSeconds * 0.45)), 'Notice your breathing without needing to change it.'),
    cue('meditation-being', Math.min(durationSeconds - 15, Math.floor(durationSeconds * 0.72)), 'Allow yourself to simply be here for a moment.'),
  ];
}

export function getBreathingPhase(elapsedSeconds: number) {
  const phase = Math.floor(Math.max(0, elapsedSeconds) % 16 / 4);
  const phases = [
    { label: 'Breathe in', detail: 'Inhale for 4', index: 0 },
    { label: 'Hold', detail: 'Hold for 4', index: 1 },
    { label: 'Breathe out', detail: 'Exhale for 4', index: 2 },
    { label: 'Hold', detail: 'Hold for 4', index: 3 },
  ];

  return phases[phase];
}

export function createGuidedSessionPlan(task: GardenTask, responses: CareResponses): GuidedSessionPlan | null {
  if (!isGuidedGardenTask(task)) {
    return null;
  }

  const guidedActivityConfig = getGuidedActivityConfig(task.category);
  const durationMinutes = guidedActivityConfig.durationMinutes;
  const durationSeconds = durationMinutes * 60;
  const basePlan = {
    taskId: task.id,
    type: task.category,
    title: guidedActivityConfig.title,
    description: task.description,
    durationMinutes,
    durationSeconds,
  };

  switch (task.category) {
    case 'breathing':
      return {
        ...basePlan,
        readyMessage: 'We will follow an easy, steady Box Breathing rhythm: four in, four hold, four out, four hold.',
        musicRecommended: false,
        cues: getBreathingCues(durationSeconds),
      };
    case 'stretching':
      return {
        ...basePlan,
        readyMessage: 'Wear anything comfortable and move only within a range that feels good for you.',
        safetyNote: 'Move slowly. Stop if you feel pain, dizziness, or discomfort.',
        musicRecommended: false,
        cues: getStretchCues(durationSeconds),
      };
    case 'affirmations':
      return {
        ...basePlan,
        readyMessage: 'You will hear one affirmation at a time, with quiet space to let each one land.',
        musicRecommended: false,
        cues: getAffirmationCues(durationSeconds, responses),
      };
    case 'meditation':
      return {
        ...basePlan,
        readyMessage: 'Settle somewhere comfortable. Gentle voice and ambient music are both optional.',
        musicRecommended: true,
        cues: getMeditationCues(durationSeconds),
      };
  }
}