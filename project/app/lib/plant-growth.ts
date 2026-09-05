export type PlantStage = 0 | 0.5 | 1 | 2 | 3 | 4;

const GROWTH_THRESHOLDS = [
  { minimum: 250, stage: 4 },
  { minimum: 200, stage: 3 },
  { minimum: 150, stage: 2 },
  { minimum: 100, stage: 1 },
  { minimum: 30, stage: 0.5 },
  { minimum: 0, stage: 0 },
] as const satisfies readonly { minimum: number; stage: PlantStage }[];

export function getPlantStage(completedTasks: number): PlantStage {
  const safeCompletedTasks = Number.isFinite(completedTasks)
    ? Math.max(0, Math.floor(completedTasks))
    : 0;

  return GROWTH_THRESHOLDS.find(({ minimum }) => safeCompletedTasks >= minimum)?.stage ?? 0;
}

export function getNextGrowthThreshold(completedTasks: number): number | null {
  const safeCompletedTasks = Number.isFinite(completedTasks)
    ? Math.max(0, Math.floor(completedTasks))
    : 0;

  return [30, 100, 150, 200, 250].find((threshold) => safeCompletedTasks < threshold) ?? null;
}
