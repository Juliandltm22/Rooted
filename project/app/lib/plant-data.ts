import AsyncStorage from '@react-native-async-storage/async-storage';
import { CARE_DAYS_STORAGE_KEY } from '@/app/lib/care-history';
import {
  isGardenTaskCategory,
  normalizeGardenPlan,
  type GardenPlan,
  type GardenTask,
  type GardenTaskCategory,
} from '@/app/lib/garden-plan';
import { DEFAULT_GARDENER_ID, isGardenerId, type GardenerId } from '@/app/lib/gardener';
import { normalizePotColorId, type PotColorId } from '@/app/lib/pot';
import { supabase } from '@/app/lib/supabase';

export interface PlantSnapshot {
  completedTaskCount: number;
  gardenerId: GardenerId;
  latestActivity: PlantLatestActivity | null;
  latestCompletionKey: string | null;
  potColor: PotColorId;
}

export interface PlantLatestActivity {
  category: GardenTaskCategory;
  title: string;
}

export interface PersistedCompletionResult {
  isNewCompletion: boolean;
  isPlanComplete: boolean;
}

export interface DailyGardenStatus {
  completedTaskCount: number;
  taskCount: number;
}

interface StoredCareDay {
  date: string;
  gardenPlan: GardenPlan;
}

interface PersistCompletionInput {
  dateKey: string;
  task: GardenTask;
  planTaskIds: string[];
}

const getHistorySyncKey = (userId: string) => `@rooted/plant-history-synced-v1/${userId}`;
const getSparkleSeenKey = (userId: string) => `@rooted/plant-sparkle-seen-v2/${userId}`;

interface PlantSparkleCheckpoint {
  completedTaskCount: number;
  latestCompletionKey: string | null;
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw error ?? new Error('You need to be signed in to tend your plant.');
  }

  return data.user.id;
}

function readStoredCareDays(value: string | null): StoredCareDay[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || !('records' in parsed)) {
      return [];
    }

    const records = (parsed as { records: unknown }).records;
    if (!records || typeof records !== 'object') {
      return [];
    }

    return Object.entries(records).flatMap(([date, value]) => {
      if (!value || typeof value !== 'object' || !('gardenPlan' in value)) {
        return [];
      }

      const plan = normalizeGardenPlan((value as { gardenPlan: unknown }).gardenPlan);
      return plan ? [{ date, gardenPlan: plan }] : [];
    });
  } catch {
    return [];
  }
}

async function syncStoredGardenHistory(userId: string) {
  const historySyncKey = getHistorySyncKey(userId);
  if (await AsyncStorage.getItem(historySyncKey) === 'true') {
    return;
  }

  const storedCareDays = readStoredCareDays(await AsyncStorage.getItem(CARE_DAYS_STORAGE_KEY));

  for (const { date, gardenPlan } of storedCareDays) {
    const { error: planError } = await supabase.from('garden_daily_plans').upsert({
      user_id: userId,
      plan_date: date,
      task_count: gardenPlan.tasks.length,
    }, {
      onConflict: 'user_id,plan_date',
      ignoreDuplicates: true,
    });

    if (planError) {
      throw planError;
    }

    const completedTasks = gardenPlan.tasks.filter((task) => task.completed);
    if (completedTasks.length > 0) {
      const { error: completionError } = await supabase.from('garden_task_completions').upsert(
        completedTasks.map((task) => ({
          user_id: userId,
          plan_date: date,
          task_id: task.id,
          task_category: task.category,
          task_title: task.title,
        })),
        {
          onConflict: 'user_id,plan_date,task_id',
          ignoreDuplicates: true,
        },
      );

      if (completionError) {
        throw completionError;
      }
    }

    if (gardenPlan.tasks.length > 0 && completedTasks.length === gardenPlan.tasks.length) {
      const { error: completedPlanError } = await supabase
        .from('garden_daily_plans')
        .update({ completed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('plan_date', date)
        .is('completed_at', null);

      if (completedPlanError) {
        throw completedPlanError;
      }
    }
  }

  await AsyncStorage.setItem(historySyncKey, 'true');
}

export async function syncGardenDailyPlan(dateKey: string, taskCount: number) {
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase.from('garden_daily_plans').upsert({
    user_id: userId,
    plan_date: dateKey,
    task_count: taskCount,
  }, {
    onConflict: 'user_id,plan_date',
    ignoreDuplicates: true,
  });

  if (error) {
    throw error;
  }
}

export async function persistGardenTaskCompletion({
  dateKey,
  task,
  planTaskIds,
}: PersistCompletionInput): Promise<PersistedCompletionResult> {
  const userId = await getAuthenticatedUserId();

  const { error: planError } = await supabase.from('garden_daily_plans').upsert({
    user_id: userId,
    plan_date: dateKey,
    task_count: planTaskIds.length,
  }, {
    onConflict: 'user_id,plan_date',
    ignoreDuplicates: true,
  });

  if (planError) {
    throw planError;
  }

  const { data: insertedRows, error: completionError } = await supabase
    .from('garden_task_completions')
    .upsert({
      user_id: userId,
      plan_date: dateKey,
      task_id: task.id,
      task_category: task.category,
      task_title: task.title,
    }, {
      onConflict: 'user_id,plan_date,task_id',
      ignoreDuplicates: true,
    })
    .select('task_id');

  if (completionError) {
    throw completionError;
  }

  const { data: completedRows, error: completedRowsError } = await supabase
    .from('garden_task_completions')
    .select('task_id')
    .eq('user_id', userId)
    .eq('plan_date', dateKey)
    .in('task_id', planTaskIds);

  if (completedRowsError) {
    throw completedRowsError;
  }

  const completedTaskIds = new Set((completedRows ?? []).map((row) => row.task_id));
  const isPlanComplete = planTaskIds.length > 0 && planTaskIds.every((taskId) => completedTaskIds.has(taskId));

  if (isPlanComplete) {
    const { error: planCompletionError } = await supabase
      .from('garden_daily_plans')
      .update({
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('plan_date', dateKey)
      .is('completed_at', null);

    if (planCompletionError) {
      throw planCompletionError;
    }
  }

  return {
    isNewCompletion: (insertedRows?.length ?? 0) > 0,
    isPlanComplete,
  };
}

export async function persistGardenTaskIncomplete(dateKey: string, taskId: string) {
  const userId = await getAuthenticatedUserId();
  const { error: completionError } = await supabase
    .from('garden_task_completions')
    .delete()
    .eq('user_id', userId)
    .eq('plan_date', dateKey)
    .eq('task_id', taskId);

  if (completionError) {
    throw completionError;
  }

  const { error: planError } = await supabase
    .from('garden_daily_plans')
    .update({ completed_at: null })
    .eq('user_id', userId)
    .eq('plan_date', dateKey);

  if (planError) {
    throw planError;
  }
}

export async function fetchPlantSnapshot(): Promise<PlantSnapshot> {
  const userId = await getAuthenticatedUserId();

  // One-time-compatible backfill: existing local Care history becomes part of
  // the persisted ledger without ever duplicating a task completion.
  await syncStoredGardenHistory(userId);

  const [profileResult, completionResult, latestCompletionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('pot_color, avatar_url')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('garden_task_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('garden_task_completions')
      .select('plan_date, task_id, task_category, task_title, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (completionResult.error) {
    throw completionResult.error;
  }

  if (latestCompletionResult.error) {
    throw latestCompletionResult.error;
  }

  const latestCompletion = latestCompletionResult.data;
  const latestActivity = latestCompletion && isGardenTaskCategory(latestCompletion.task_category)
    ? {
        category: latestCompletion.task_category,
        title: latestCompletion.task_title,
      }
    : null;

  return {
    completedTaskCount: completionResult.count ?? 0,
    gardenerId: isGardenerId(profileResult.data?.avatar_url)
      ? profileResult.data.avatar_url
      : DEFAULT_GARDENER_ID,
    latestActivity,
    latestCompletionKey: latestCompletion
      ? `${latestCompletion.plan_date}/${latestCompletion.task_id}/${latestCompletion.completed_at}`
      : null,
    potColor: normalizePotColorId(profileResult.data?.pot_color),
  };
}

export async function fetchDailyGardenStatus(dateKey: string): Promise<DailyGardenStatus> {
  const userId = await getAuthenticatedUserId();

  const [planResult, completionResult] = await Promise.all([
    supabase
      .from('garden_daily_plans')
      .select('task_count')
      .eq('user_id', userId)
      .eq('plan_date', dateKey)
      .maybeSingle(),
    supabase
      .from('garden_task_completions')
      .select('task_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('plan_date', dateKey),
  ]);

  if (planResult.error) {
    throw planResult.error;
  }
  if (completionResult.error) {
    throw completionResult.error;
  }

  return {
    taskCount: planResult.data?.task_count ?? 0,
    completedTaskCount: completionResult.count ?? 0,
  };
}

export async function claimTaskCompletionCelebration({
  completedTaskCount,
  latestCompletionKey,
}: Pick<PlantSnapshot, 'completedTaskCount' | 'latestCompletionKey'>): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  const sparkleSeenKey = getSparkleSeenKey(userId);
  const storedCheckpoint = await AsyncStorage.getItem(sparkleSeenKey);
  let checkpoint: PlantSparkleCheckpoint | null = null;

  if (storedCheckpoint) {
    try {
      const parsedCheckpoint = JSON.parse(storedCheckpoint) as Partial<PlantSparkleCheckpoint>;
      if (
        typeof parsedCheckpoint.completedTaskCount === 'number' &&
        (typeof parsedCheckpoint.latestCompletionKey === 'string' ||
          parsedCheckpoint.latestCompletionKey === null)
      ) {
        checkpoint = {
          completedTaskCount: parsedCheckpoint.completedTaskCount,
          latestCompletionKey: parsedCheckpoint.latestCompletionKey,
        };
      }
    } catch {
      // A malformed checkpoint is treated as an unseen completion.
    }
  }

  if (checkpoint?.latestCompletionKey === latestCompletionKey) {
    return false;
  }

  const nextCheckpoint: PlantSparkleCheckpoint = {
    completedTaskCount,
    latestCompletionKey,
  };
  await AsyncStorage.setItem(sparkleSeenKey, JSON.stringify(nextCheckpoint));

  if (!latestCompletionKey) {
    return false;
  }

  // A lower count means a task was unchecked, which should update the
  // checkpoint without playing a completion celebration.
  return checkpoint === null || completedTaskCount >= checkpoint.completedTaskCount;
}
