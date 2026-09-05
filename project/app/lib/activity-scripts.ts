import voiceCueText from '@/shared/care-voice-cues.json';
import type { GuidedActivityType } from './garden-plan';

export type VoiceCueId = keyof typeof voiceCueText;

export interface VoiceCue {
  id: VoiceCueId;
  atMs: number;
  text: string;
}

export interface DisplayCue {
  id: string;
  atMs: number;
  label?: string;
  text: string;
}

export interface ActivityScript {
  durationMs: number;
  voiceCues: VoiceCue[];
  displayCues: DisplayCue[];
}

const BREATHING_DURATION_MS = 2 * 60 * 1000;
const AFFIRMATION_DURATION_MS = 3 * 60 * 1000;
const FIVE_MINUTE_DURATION_MS = 5 * 60 * 1000;
export const BREATHING_GUIDANCE_START_MS = 32_000;
export const BREATHING_CLOSING_START_MS = 112_000;
const BREATHING_PHASE_MS = 4_000;

function voiceCue(id: VoiceCueId, atMs: number): VoiceCue {
  return { id, atMs, text: voiceCueText[id] };
}

function displayCue(id: string, atMs: number, text: string, label?: string): DisplayCue {
  return { id, atMs, text, label };
}

function createBreathingVoiceCues(): VoiceCue[] {
  const phaseIds: VoiceCueId[] = [
    'breathing-in',
    'breathing-hold',
    'breathing-out',
    'breathing-hold',
  ];
  const cues = [voiceCue('breathing-intro', 0)];

  for (let atMs = BREATHING_GUIDANCE_START_MS; atMs < BREATHING_CLOSING_START_MS; atMs += BREATHING_PHASE_MS) {
    const phaseIndex = Math.floor((atMs - BREATHING_GUIDANCE_START_MS) / BREATHING_PHASE_MS) % phaseIds.length;
    cues.push(voiceCue(phaseIds[phaseIndex], atMs));
  }

  cues.push(voiceCue('breathing-closing', BREATHING_CLOSING_START_MS));
  return cues;
}

const affirmationSchedule: [VoiceCueId, number][] = [
  ['affirmation-intro', 0],
  ['affirmation-worthy', 26_000],
  ['affirmation-capable', 32_000],
  ['affirmation-enough', 38_000],
  ['affirmation-patience-kindness', 45_000],
  ['affirmation-handle-present', 53_000],
  ['affirmation-one-step', 61_000],
  ['affirmation-growing', 70_000],
  ['affirmation-not-figured-out', 78_000],
  ['affirmation-showing-up', 88_000],
  ['affirmation-peace', 96_000],
  ['affirmation-feelings', 104_000],
  ['affirmation-begin-again', 115_000],
  ['affirmation-small-steps', 124_000],
  ['affirmation-kindness-to-others', 134_000],
  ['affirmation-move-forward', 145_000],
  ['affirmation-closing', 156_000],
];

const meditationSchedule: [VoiceCueId, number][] = [
  ['meditation-settle', 0],
  ['meditation-breathing', 35_000],
  ['meditation-release-tension', 75_000],
  ['meditation-thoughts', 120_000],
  ['meditation-center', 180_000],
  ['meditation-return', 245_000],
  ['meditation-closing', 280_000],
];

const affirmationCues = affirmationSchedule.map(([id, atMs]) => voiceCue(id, atMs));
const meditationCues = meditationSchedule.map(([id, atMs]) => voiceCue(id, atMs));

export const ACTIVITY_SCRIPTS: Record<GuidedActivityType, ActivityScript> = {
  breathing: {
    durationMs: BREATHING_DURATION_MS,
    voiceCues: createBreathingVoiceCues(),
    displayCues: [
      displayCue('breathing-intro', 0, voiceCueText['breathing-intro'], 'Box breathing'),
      displayCue('breathing-closing', BREATHING_CLOSING_START_MS, voiceCueText['breathing-closing'], 'Closing breath'),
    ],
  },
  stretching: {
    durationMs: FIVE_MINUTE_DURATION_MS,
    voiceCues: [],
    displayCues: [
      displayCue('shoulder-rolls', 0, 'Let your arms rest. Slowly roll both shoulders backward, keeping the movement small and comfortable.', 'Shoulder rolls'),
      displayCue('neck-shoulder-release', 50_000, 'Relax your jaw, then gently lower one ear toward its shoulder. Keep both shoulders soft and switch sides when ready.', 'Neck and shoulder release'),
      displayCue('side-stretch', 100_000, 'Reach one arm overhead and lean just a little to the opposite side. Breathe, then change sides.', 'Gentle side stretch'),
      displayCue('seated-twist', 150_000, 'Sit tall and slowly turn your chest to one side without forcing the stretch. Return to center, then switch sides.', 'Easy seated twist'),
      displayCue('chest-opener', 200_000, 'Gently draw your shoulder blades toward one another. Keep your ribs soft and breathe comfortably.', 'Chest and shoulder opener'),
      displayCue('wrist-forearm', 250_000, 'Extend one arm, then use the other hand to guide the fingers back only until you feel a mild stretch. Switch hands.', 'Wrist and forearm stretch'),
    ],
  },
  affirmations: {
    durationMs: AFFIRMATION_DURATION_MS,
    voiceCues: affirmationCues,
    displayCues: affirmationCues.map((cue) => displayCue(
      cue.id,
      cue.atMs,
      cue.text,
      cue.id === 'affirmation-intro'
        ? 'Settle in'
        : cue.id === 'affirmation-closing'
          ? 'Closing thought'
          : 'Repeat after me',
    )),
  },
  meditation: {
    durationMs: FIVE_MINUTE_DURATION_MS,
    voiceCues: meditationCues,
    displayCues: meditationCues.map((cue) => displayCue(cue.id, cue.atMs, cue.text, 'Gentle guidance')),
  },
};

export function getActivityScript(type: GuidedActivityType): ActivityScript {
  return ACTIVITY_SCRIPTS[type];
}

export function getActiveDisplayCue(script: ActivityScript, elapsedMs: number): DisplayCue | null {
  let activeCue: DisplayCue | null = null;

  for (const cue of script.displayCues) {
    if (cue.atMs > elapsedMs) {
      break;
    }
    activeCue = cue;
  }

  return activeCue;
}

export interface BreathingPhase {
  label: string;
  count: number;
}

export function getBreathingPhase(elapsedMs: number): BreathingPhase | null {
  if (elapsedMs < BREATHING_GUIDANCE_START_MS || elapsedMs >= BREATHING_CLOSING_START_MS) {
    return null;
  }

  const phaseElapsedMs = elapsedMs - BREATHING_GUIDANCE_START_MS;
  const phaseIndex = Math.floor(phaseElapsedMs / BREATHING_PHASE_MS) % 4;
  const labels = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];
  const count = 4 - Math.floor((phaseElapsedMs % BREATHING_PHASE_MS) / 1000);

  return { label: labels[phaseIndex], count };
}
