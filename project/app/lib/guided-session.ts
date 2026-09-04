import {
  getActivityScript,
  type ActivityScript,
} from './activity-scripts';
import {
  getGuidedActivityConfig,
  isGuidedGardenTask,
  type GardenTask,
  type GuidedActivityType,
} from './garden-plan';

export interface GuidedSessionPlan extends ActivityScript {
  taskId: string;
  type: GuidedActivityType;
  title: string;
  description: string;
  durationMinutes: number;
  durationSeconds: number;
  readyMessage: string;
  safetyNote?: string;
  musicRecommended: boolean;
}

export function createGuidedSessionPlan(task: GardenTask): GuidedSessionPlan | null {
  if (!isGuidedGardenTask(task)) {
    return null;
  }

  const guidedActivityConfig = getGuidedActivityConfig(task.category);
  const script = getActivityScript(task.category);
  const durationMinutes = guidedActivityConfig.durationMinutes;
  if (script.durationMs !== durationMinutes * 60 * 1000) {
    throw new Error(`Guided script duration does not match the fixed ${task.category} activity duration.`);
  }
  const basePlan = {
    ...script,
    taskId: task.id,
    type: task.category,
    title: guidedActivityConfig.title,
    description: task.description,
    durationMinutes,
    durationSeconds: script.durationMs / 1000,
  };

  switch (task.category) {
    case 'breathing':
      return {
        ...basePlan,
        readyMessage: 'We will follow an easy, steady Box Breathing rhythm: four in, four hold, four out, four hold.',
        musicRecommended: false,
      };
    case 'stretching':
      return {
        ...basePlan,
        readyMessage: 'Wear anything comfortable and move only within a range that feels good for you.',
        safetyNote: 'Move slowly. Stop if you feel pain, dizziness, or discomfort.',
        musicRecommended: false,
      };
    case 'affirmations':
      return {
        ...basePlan,
        readyMessage: 'You will hear one affirmation at a time, with quiet space to repeat each one aloud or silently.',
        musicRecommended: false,
      };
    case 'meditation':
      return {
        ...basePlan,
        readyMessage: 'Settle somewhere comfortable. Gentle voice and ambient sound are both optional.',
        musicRecommended: true,
      };
  }
}
