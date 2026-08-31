import type { CareEmotion, CareResponses } from '@/app/(tabs)/care/care-responses';

export type GuidedActivityType = 'breathing' | 'stretching' | 'affirmations' | 'meditation';
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

const containsAny = (value: string, words: string[]) => words.some((word) => value.includes(word));

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
  const response = await withTimeout(fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responses),
  }), 15000);

  if (!response.ok) {
    throw new Error('Your Gardener could not reach the plan service.');
  }

  const plan = normalizeGardenPlan(await response.json());
  if (!plan || plan.tasks.length < 3) {
    throw new Error('Your Gardener returned a plan we could not read.');
  }

  return {
    ...plan,
    // Completion belongs to the current in-app plan, not the AI response.
    tasks: plan.tasks.slice(0, 5).map((gardenTask) => ({ ...gardenTask, completed: false })),
  };
}

async function withTimeout<T>(request: Promise<T>, milliseconds: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      request,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Your Gardener is taking longer than expected. Please try again.')), milliseconds);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
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
    return requestRemoteGardenPlan(responses, endpoint);
  }

  // Keep the generating state visible long enough to feel intentional, without delaying the app.
  await new Promise((resolve) => setTimeout(resolve, 900));
  return createLocalGardenPlan(responses);
}
