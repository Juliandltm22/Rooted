import type { GardenTask, GardenTaskCategory } from '@/app/lib/garden-plan';

export interface PlantCareActivity {
  category: GardenTaskCategory;
  title?: string;
  description?: string;
}

export const PLAN_COMPLETED_MESSAGE =
  'Your garden is glowing! You completed today\u2019s care plan and gave your cactus everything it needed today. \u2728';

const TASK_MESSAGES: Partial<Record<GardenTaskCategory, string>> = {
  breathing: 'That breathing break gave your cactus a little room to breathe, too. Its roots are feeling calmer. \ud83c\udf31',
  calm: 'That breathing break gave your cactus a little room to breathe, too. Its roots are feeling calmer. \ud83c\udf31',
  connection: 'That moment of connection brought warmth into your garden. Your cactus felt it, too. \u2600\ufe0f',
  stretching: 'A little movement helped loosen the soil around your cactus. It has more room to grow now. \ud83c\udf3f',
  meditation: 'That quiet moment brought some peace to your garden. Your cactus soaked it right in. \ud83c\udf31',
  affirmations: 'Those kind words gave your cactus a little extra sunshine. It\u2019s standing a bit taller now. \u2600\ufe0f',
  hydration: 'Drinking water helped your cactus feel refreshed and hydrated, too. Every sip was a little act of care. \ud83d\udca7',
  rest: 'Giving yourself time to rest let your garden settle, too. Your cactus appreciates the gentler pace. \ud83c\udf19',
  reflection: 'That moment of reflection cleared a little space in your garden. Your cactus appreciates the care. \ud83c\udf3f',
};

const JOURNAL_MESSAGE =
  'Getting those thoughts out cleared a little space in your garden. Your cactus appreciates the care. \ud83c\udf3f';
const FALLBACK_MESSAGE =
  'Every act of care reaches your garden. Your cactus is growing right alongside you, one gentle moment at a time. \ud83c\udf31';

export function getPlantCareMotivation(activity?: PlantCareActivity | null) {
  if (!activity) {
    return FALLBACK_MESSAGE;
  }

  if (
    activity.category === 'reflection' &&
    /journal|write|thought|reflect/i.test(`${activity.title ?? ''} ${activity.description ?? ''}`)
  ) {
    return JOURNAL_MESSAGE;
  }

  if (activity.category === 'movement') {
    return /walk/i.test(activity.title ?? '')
      ? 'Taking that walk gave your cactus the movement it needed, like a gentle breeze through the garden. \ud83c\udf3f'
      : 'That movement brought a gentle breeze through your garden. Your cactus is feeling brighter, too. \ud83c\udf3f';
  }

  return TASK_MESSAGES[activity.category] ?? FALLBACK_MESSAGE;
}

export function getTaskCompletedMessage(task: GardenTask) {
  return getPlantCareMotivation(task);
}
