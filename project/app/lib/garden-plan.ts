import type { CareEmotion, CareResponses } from '@/app/(tabs)/care/care-responses';

export type GuidedActivityType = 'breathing' | 'stretching' | 'affirmations' | 'meditation';
export const GARDENER_ACTIVITY_TYPES = [
  'breathing',
  'stretching',
  'meditation',
  'affirmations',
  'hydration',
] as const;
export type GardenerActivityType = typeof GARDENER_ACTIVITY_TYPES[number];
export type HydrationUnit = 'glass' | 'glasses';

export interface GardenerTaskSuggestion {
  type: GardenerActivityType;
  description: string;
  quantity?: number;
  unit?: HydrationUnit;
}

export interface GardenerResponse {
  message: string;
  tasks: GardenerTaskSuggestion[];
}

export type GardenTaskCategory =
  | 'calm'
  | 'connection'
  | 'hydration'
  | 'movement'
  | 'rest'
  | 'reflection'
  | GuidedActivityType;

export const GUIDED_ACTIVITY_TYPES: GuidedActivityType[] = [
  'breathing',
  'stretching',
  'affirmations',
  'meditation',
];

export const GARDEN_TASK_CATEGORIES: GardenTaskCategory[] = [
  'calm',
  'connection',
  'hydration',
  'movement',
  'rest',
  'reflection',
  ...GUIDED_ACTIVITY_TYPES,
];

/** Product rules. Guided-session duration is never selected by the Gardener. */
export const GUIDED_ACTIVITY_CONFIG: Record<GuidedActivityType, {
  durationMinutes: number;
  title: string;
}> = {
  breathing: { durationMinutes: 2, title: '2-Minute Breathing' },
  stretching: { durationMinutes: 5, title: '5-Minute Stretch' },
  affirmations: { durationMinutes: 3, title: '3-Minute Affirmations' },
  meditation: { durationMinutes: 5, title: '5-Minute Meditation' },
};

/** Allowed AI-selectable activities. Titles and durations are owned by Rooted. */
export const GARDENER_ACTIVITY_CATALOG: Record<GardenerActivityType, {
  title: string;
  guided: boolean;
  durationMinutes?: number;
}> = {
  breathing: { ...GUIDED_ACTIVITY_CONFIG.breathing, guided: true },
  stretching: { ...GUIDED_ACTIVITY_CONFIG.stretching, guided: true },
  meditation: { ...GUIDED_ACTIVITY_CONFIG.meditation, guided: true },
  affirmations: { ...GUIDED_ACTIVITY_CONFIG.affirmations, guided: true },
  hydration: { title: 'Glass of Water', guided: false },
};

export interface GardenTask {
  id: string;
  title: string;
  description: string;
  category: GardenTaskCategory;
  guided: boolean;
  durationMinutes?: number;
  completed: boolean;
}

export interface GardenPlan {
  title: string;
  encouragement: string;
  tasks: GardenTask[];
}

const emotionCopy: Record<CareEmotion, string> = {
  great: 'Your energy is a lovely thing to build on today.',
  calm: 'You have a calm foundation to care for today.',
  tired: 'A gentle, low-pressure day can still be a meaningful one.',
  sad: 'Small acts of care are enough for today.',
  stressed: 'We can make a little room to breathe, one step at a time.',
  okay: 'A few steady moments can help your day feel more grounded.',
};

const task = (
  id: string,
  title: string,
  description: string,
  category: Exclude<GardenTaskCategory, GuidedActivityType>,
): GardenTask => ({ id, title, description, category, guided: false, completed: false });

const guidedTask = (
  id: string,
  description: string,
  category: GuidedActivityType,
): GardenTask => ({
  id,
  title: GUIDED_ACTIVITY_CONFIG[category].title,
  description,
  category,
  guided: true,
  durationMinutes: GUIDED_ACTIVITY_CONFIG[category].durationMinutes,
  completed: false,
});

export function isGuidedActivityType(value: unknown): value is GuidedActivityType {
  return typeof value === 'string' && GUIDED_ACTIVITY_TYPES.includes(value as GuidedActivityType);
}

export function isGardenerActivityType(value: unknown): value is GardenerActivityType {
  return typeof value === 'string' && GARDENER_ACTIVITY_TYPES.includes(value as GardenerActivityType);
}

export function isGardenTaskCategory(value: unknown): value is GardenTaskCategory {
  return typeof value === 'string' && GARDEN_TASK_CATEGORIES.includes(value as GardenTaskCategory);
}

export function getGuidedActivityConfig(type: GuidedActivityType) {
  return GUIDED_ACTIVITY_CONFIG[type];
}

export function isGuidedGardenTask(taskValue: GardenTask): taskValue is GardenTask & {
  category: GuidedActivityType;
  guided: true;
  durationMinutes: number;
} {
  return taskValue.guided && isGuidedActivityType(taskValue.category);
}

/** Makes untrusted plan data safe to render and applies fixed guided-session rules. */
export function normalizeGardenTask(value: unknown): GardenTask | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const taskValue = value as Partial<GardenTask>;
  if (
    typeof taskValue.id !== 'string' ||
    typeof taskValue.title !== 'string' ||
    typeof taskValue.description !== 'string' ||
    !isGardenTaskCategory(taskValue.category) ||
    typeof taskValue.completed !== 'boolean'
  ) {
    return null;
  }

  const guided = isGuidedActivityType(taskValue.category);

  return {
    id: taskValue.id,
    title: guided ? GUIDED_ACTIVITY_CONFIG[taskValue.category as GuidedActivityType].title : taskValue.title,
    description: taskValue.description,
    category: taskValue.category,
    guided,
    ...(guided ? { durationMinutes: GUIDED_ACTIVITY_CONFIG[taskValue.category as GuidedActivityType].durationMinutes } : {}),
    completed: taskValue.completed,
  };
}

export function normalizeGardenPlan(value: unknown): GardenPlan | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const plan = value as Partial<GardenPlan>;
  if (typeof plan.title !== 'string' || typeof plan.encouragement !== 'string' || !Array.isArray(plan.tasks)) {
    return null;
  }

  const tasks = plan.tasks.map(normalizeGardenTask);
  if (tasks.some((item) => item === null)) {
    return null;
  }

  return { title: plan.title, encouragement: plan.encouragement, tasks: tasks as GardenTask[] };
}

function isShortNonEmptyString(value: unknown, maximumLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maximumLength;
}

/** Validates the small provider-owned shape before any AI content reaches the UI. */
export function normalizeGardenerResponse(value: unknown): GardenerResponse | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const response = value as Partial<GardenerResponse>;
  if (!isShortNonEmptyString(response.message, 500) || !Array.isArray(response.tasks) || response.tasks.length !== 3) {
    return null;
  }

  const seenTypes = new Set<GardenerActivityType>();
  const tasks: GardenerTaskSuggestion[] = [];

  for (const taskValue of response.tasks) {
    if (!taskValue || typeof taskValue !== 'object') {
      return null;
    }

    const suggestion = taskValue as Partial<GardenerTaskSuggestion>;
    if (
      !isGardenerActivityType(suggestion.type) ||
      seenTypes.has(suggestion.type) ||
      !isShortNonEmptyString(suggestion.description, 220)
    ) {
      return null;
    }

    if (suggestion.type === 'hydration') {
      if (
        !Number.isInteger(suggestion.quantity) ||
        (suggestion.quantity ?? 0) < 1 ||
        (suggestion.quantity ?? 0) > 3 ||
        (suggestion.unit !== 'glass' && suggestion.unit !== 'glasses') ||
        (suggestion.quantity === 1 ? suggestion.unit !== 'glass' : suggestion.unit !== 'glasses')
      ) {
        return null;
      }
    } else if (suggestion.quantity !== undefined || suggestion.unit !== undefined) {
      return null;
    }

    seenTypes.add(suggestion.type);
    tasks.push({
      type: suggestion.type,
      description: suggestion.description.trim(),
      ...(suggestion.type === 'hydration'
        ? { quantity: suggestion.quantity, unit: suggestion.unit }
        : {}),
    });
  }

  return { message: response.message.trim(), tasks };
}

/** Maps validated AI choices onto Rooted-owned titles, timers, and navigation types. */
export function gardenPlanFromGardenerResponse(value: unknown): GardenPlan | null {
  const gardenerResponse = normalizeGardenerResponse(value);
  if (!gardenerResponse) {
    return null;
  }

  return {
    title: "Today's Garden Plan",
    encouragement: gardenerResponse.message,
    tasks: gardenerResponse.tasks.map((suggestion, index) => {
      if (suggestion.type === 'hydration') {
        const quantity = suggestion.quantity as number;
        return {
          id: `gardener-hydration-${index}`,
          title: `${quantity} ${quantity === 1 ? 'Glass' : 'Glasses'} of Water`,
          description: suggestion.description,
          category: 'hydration',
          guided: false,
          completed: false,
        };
      }

      const activity = GARDENER_ACTIVITY_CATALOG[suggestion.type];
      return {
        id: `gardener-${suggestion.type}-${index}`,
        title: activity.title,
        description: suggestion.description,
        category: suggestion.type,
        guided: true,
        durationMinutes: activity.durationMinutes,
        completed: false,
      };
    }),
  };
}

const containsAny = (value: string, words: string[]) => words.some((word) => value.includes(word));

const IMMEDIATE_DANGER_PATTERNS = [
  /\bkill myself\b/i,
  /\bend my (?:own )?life\b/i,
  /\bi want to die\b/i,
  /\bi(?:'m| am) suicidal\b/i,
  /\bsuicide plan\b/i,
  /\bhurt myself\b/i,
  /\bself[- ]harm\b/i,
  /\bdon't want to (?:be alive|live)\b/i,
];

export function containsImmediateDanger(value: string): boolean {
  return IMMEDIATE_DANGER_PATTERNS.some((pattern) => pattern.test(value));
}

function taskForContext(feelings: string): GardenTask | null {
  const normalizedFeelings = feelings.toLowerCase();

  if (containsAny(normalizedFeelings, ['school', 'work', 'busy', 'overwhelm', 'overwhelmed', 'deadline'])) {
    return task(
      'one-thing',
      'Choose one gentle next step',
      'Write down one task that would make today feel a little lighter, then give it 10 focused minutes.',
      'reflection',
    );
  }

  if (containsAny(normalizedFeelings, ['lonely', 'alone', 'friend', 'miss'])) {
    return task(
      'connection',
      'Share a small check-in',
      'Send a kind message to someone you trust—one sentence is plenty.',
      'connection',
    );
  }

  if (containsAny(normalizedFeelings, ['excited', 'energized', 'energy', 'motivated'])) {
    return task(
      'outside',
      'Use your energy outside',
      'Take a 10-minute walk outdoors or stand in fresh air and notice three things around you.',
      'movement',
    );
  }

  return task(
    'check-in',
    'Make space for what you shared',
    'Take five quiet minutes to name what is on your mind and one small thing that could support you.',
    'reflection',
  );
}

function guidedTaskForContext({ emotion, sleepHours, additionalFeelings }: CareResponses): GardenTask | null {
  const normalizedFeelings = additionalFeelings.toLowerCase();
  const normalizedSleepHours = sleepHours ?? 8;
  const feelsAnxious = containsAny(normalizedFeelings, ['anxious', 'anxiety', 'worried', 'stress', 'stressed', 'nervous', 'overwhelm']);

  if (emotion === 'stressed' || feelsAnxious) {
    return guidedTask('guided-breathing', 'Slow things down with a calm, guided Box Breathing session.', 'breathing');
  }

  if (emotion === 'tired' || normalizedSleepHours < 6) {
    return guidedTask('guided-stretching', 'Reconnect with your body through a few simple, gentle stretches.', 'stretching');
  }

  if (emotion === 'sad') {
    return guidedTask('guided-meditation', 'Settle into a quiet moment with soft, optional guidance.', 'meditation');
  }

  if (emotion === 'great') {
    return guidedTask('guided-affirmations', 'Pause with a few warm words to carry your energy forward.', 'affirmations');
  }

  return null;
}

function createLocalGardenPlan({ emotion, sleepHours, additionalFeelings }: CareResponses): GardenPlan {
  if (!emotion) {
    throw new Error('Please choose how you are feeling before asking your Gardener for a plan.');
  }

  if (sleepHours === null || !Number.isFinite(sleepHours)) {
    throw new Error('Please add how long you slept before asking your Gardener for a plan.');
  }

  if (containsImmediateDanger(additionalFeelings)) {
    return {
      title: 'Please Reach Out Now',
      encouragement: 'I am really glad you shared this. If you might act on these thoughts or are in immediate danger, call local emergency services now or go to the nearest emergency department. In the U.S. or Canada, call or text 988. Stay with someone you trust and move away from anything you could use to hurt yourself. Rooted is not emergency care.',
      tasks: [
        guidedTask('urgent-breathing', 'While you contact human support, keep your feet on the floor and take slow, steady breaths.', 'breathing'),
        task('urgent-water', '1 Glass of Water', 'If it is safe, take a glass of water while you stay with another person.', 'hydration'),
        guidedTask('urgent-affirmations', 'You deserve immediate human support. Keep reaching out until someone responds.', 'affirmations'),
      ],
    };
  }

  const tasks: GardenTask[] = [];
  const contextTask = additionalFeelings.trim() ? taskForContext(additionalFeelings) : null;
  const guidedActivity = guidedTaskForContext({ emotion, sleepHours, additionalFeelings });

  if (contextTask) {
    tasks.push(contextTask);
  }

  if (guidedActivity) {
    tasks.push(guidedActivity);
  }

  if (sleepHours < 6) {
    tasks.push(task('rest', 'Plan a softer evening', 'Choose a wind-down time for tonight and set aside 15 screen-free minutes before bed.', 'rest'));
  } else if (sleepHours < 7.5) {
    tasks.push(task('pause', 'Protect one quiet pause', 'Take five minutes between tasks to stretch, breathe, or simply sit without a screen.', 'rest'));
  }

  if (emotion === 'great' || emotion === 'calm') {
    tasks.push(task('movement', 'Move in a way that feels good', 'Choose 15 minutes of movement you enjoy—walking, stretching, dancing, or getting outside.', 'movement'));
  } else if (emotion === 'tired') {
    tasks.push(task('stretch', 'Wake up gently', 'Try three slow stretches and a glass of water before asking more of yourself.', 'movement'));
  } else if (!guidedActivity) {
    tasks.push(task('breathe', 'Give yourself a breathing break', 'Breathe in for four and out for six, repeating for two unhurried minutes.', 'calm'));
  }

  tasks.push(task(
    'water',
    'Drink a glass of water',
    sleepHours < 6
      ? 'A glass of water is a small way to support your low-energy day.'
      : sleepHours >= 8
        ? 'You gave yourself a solid night of rest—keep that care going with a refreshing glass of water.'
        : 'Take a refreshing pause and have a full glass of water.',
    'hydration',
  ));

  if (emotion === 'sad' || emotion === 'stressed') {
    tasks.push(task('kindness', 'Offer yourself one kind sentence', 'Write or say something you would tell a friend having a hard day.', 'reflection'));
  } else if (emotion === 'great') {
    tasks.push(task('momentum', 'Keep a little positive momentum', 'Do one meaningful thing you have been looking forward to, even if it only takes 10 minutes.', 'reflection'));
  } else {
    tasks.push(task('notice', 'Notice one good moment', 'Later today, pause to name one thing that felt supportive, pleasant, or peaceful.', 'reflection'));
  }

  return {
    title: "Today's Garden Plan",
    encouragement: emotionCopy[emotion],
    tasks: tasks.slice(0, 5),
  };
}

async function requestRemoteGardenPlan(responses: CareResponses, endpoint: string): Promise<GardenPlan> {
  const response = await fetchWithTimeout(endpoint, {
    mood: responses.emotion,
    sleepHours: responses.sleepHours,
    writtenResponse: responses.additionalFeelings.trim(),
  });

  if (!response.ok) {
    throw new Error('Your Gardener could not reach the plan service.');
  }

  const plan = gardenPlanFromGardenerResponse(await response.json());
  if (!plan) {
    throw new Error('Your Gardener returned a plan we could not read.');
  }

  return plan;
}

const GARDENER_REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(endpoint: string, body: {
  mood: CareEmotion | null;
  sleepHours: number | null;
  writtenResponse: string;
}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GARDENER_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Uses a server endpoint when EXPO_PUBLIC_GARDEN_PLAN_ENDPOINT is configured.
 * The endpoint must keep any AI provider key on the server. Without an endpoint,
 * Rooted uses this private, on-device ruleset so the full Care flow remains testable.
 */
export async function generateGardenPlan(responses: CareResponses): Promise<GardenPlan> {
  const endpoint = process.env.EXPO_PUBLIC_GARDEN_PLAN_ENDPOINT;

  if (endpoint) {
    try {
      return await requestRemoteGardenPlan(responses, endpoint);
    } catch (error) {
      console.warn('The remote Gardener plan was unavailable. Using Rooted recommendations.', error);
    }
  }

  // Keep the existing on-device recommendation system available for every failure mode.
  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 900));
  }
  return createLocalGardenPlan(responses);
}
