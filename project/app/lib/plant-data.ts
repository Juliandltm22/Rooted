import AsyncStorage from '@react-native-async-storage/async-storage';
import { CARE_DAYS_STORAGE_KEY } from '@/app/lib/care-history';
import { normalizeGardenPlan, type GardenPlan, type GardenTask } from '@/app/lib/garden-plan';
import { normalizePotColorId, type PotColorId } from '@/app/lib/pot';
import { supabase } from '@/app/lib/supabase';

export interface PlantSnapshot {
  completedTaskCount: number;
  potColor: PotColorId;
}

export interface PersistedCompletionResult {
  isNewCompletion: boolean;
  isPlanComplete: boolean;
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

  const [profileResult, completionResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('pot_color')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('garden_task_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  if (completionResult.error) {
    throw completionResult.error;
  }

  return {
    completedTaskCount: completionResult.count ?? 0,
    potColor: normalizePotColorId(profileResult.data?.pot_color),
  };
}

export async function claimGardenPlanCelebration(dateKey: string): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('garden_daily_plans')
    .update({ celebration_seen_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('plan_date', dateKey)
    .not('completed_at', 'is', null)
    .is('celebration_seen_at', null)
    .select('plan_date');

  if (error) {
    throw error;
  }

  return (data?.length ?? 0) > 0;
}
