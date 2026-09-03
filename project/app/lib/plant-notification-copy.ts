import type { GardenTask } from '@/app/lib/garden-plan';

export const PLAN_COMPLETED_MESSAGE =
  'Your garden is glowing! You completed today\u2019s care plan and gave your cactus everything it needed today. \u2728';

const TASK_MESSAGES: Partial<Record<GardenTask['category'], string>> = {
  breathing: 'That breathing break gave your cactus a little room to breathe, too. Its roots are feeling calmer. \ud83c\udf31',
  calm: 'That breathing break gave your cactus a little room to breathe, too. Its roots are feeling calmer. \ud83c\udf31',
  stretching: 'A little movement helped loosen the soil around your cactus. It has more room to grow now. \ud83c\udf3f',
  meditation: 'That quiet moment brought some peace to your garden. Your cactus soaked it right in. \ud83c\udf31',
  affirmations: 'Those kind words gave your cactus a little extra sunshine. It\u2019s standing a bit taller now. \u2600\ufe0f',
  hydration: 'Taking care of your body gave your cactus a refreshing little boost, too. \ud83d\udca7',
  movement: 'That movement brought some fresh air into your garden. Your cactus is looking brighter. \ud83c\udf31',
};

const JOURNAL_MESSAGE =
  'Getting those thoughts out cleared a little space in your garden. Your cactus appreciates the care. \ud83c\udf3f';
const FALLBACK_MESSAGE =
  'Another little act of care reached your garden. Your cactus is growing right alongside you. \ud83c\udf31';

export function getTaskCompletedMessage(task: GardenTask) {
  if (
    task.category === 'reflection' &&
    /journal|write|thought|reflect/i.test(`${task.title} ${task.description}`)
  ) {
    return JOURNAL_MESSAGE;
  }

  return TASK_MESSAGES[task.category] ?? FALLBACK_MESSAGE;
}
