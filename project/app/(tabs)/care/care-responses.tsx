import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeGardenPlan, type GardenPlan } from '@/app/lib/garden-plan';
import { CARE_DAYS_STORAGE_KEY, CARE_MOODS, type Mood } from '@/app/lib/care-history';

export type CareEmotion = Mood;

export interface CareResponses {
  emotion: CareEmotion | null;
  sleepHours: number | null;
  additionalFeelings: string;
}

interface CareDay extends CareResponses {
  date: string;
  gardenPlan: GardenPlan | null;
}

interface CareResponsesContextValue {
  responses: CareResponses;
  gardenPlan: GardenPlan | null;
  careDate: string;
  isReady: boolean;
  setEmotion: (emotion: CareEmotion) => void;
  setSleepHours: (hours: number) => void;
  setAdditionalFeelings: (feelings: string) => void;
  setGardenPlan: (plan: GardenPlan) => void;
  toggleTaskCompletion: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  ensureCurrentDay: () => boolean;
  simulateNextDayForDevelopment: () => void;
}

const DEFAULT_SLEEP_HOURS = 8;

const CareResponsesContext = createContext<CareResponsesContextValue | undefined>(undefined);

function getLocalCalendarDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getNextCalendarDate(date: string) {
  const nextDate = new Date(`${date}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  return getLocalCalendarDate(nextDate);
}

function createEmptyCareDay(date: string): CareDay {
  return {
    date,
    emotion: null,
    sleepHours: DEFAULT_SLEEP_HOURS,
    additionalFeelings: '',
    gardenPlan: null,
  };
}

function isGardenPlan(value: unknown): value is GardenPlan {
  return normalizeGardenPlan(value) !== null;
}

function isCareDay(value: unknown): value is CareDay {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const day = value as CareDay;
  return (
    typeof day.date === 'string' &&
    (day.emotion === null || CARE_MOODS.includes(day.emotion)) &&
    (day.sleepHours === null || (typeof day.sleepHours === 'number' && Number.isFinite(day.sleepHours))) &&
    typeof day.additionalFeelings === 'string' &&
    (day.gardenPlan === null || isGardenPlan(day.gardenPlan))
  );
}

async function loadCareDays(): Promise<Record<string, CareDay>> {
  try {
    const storedValue = await AsyncStorage.getItem(CARE_DAYS_STORAGE_KEY);
    if (!storedValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!parsedValue || typeof parsedValue !== 'object' || !('records' in parsedValue)) {
      return {};
    }

    const records = (parsedValue as { records: unknown }).records;
    if (!records || typeof records !== 'object') {
      return {};
    }

    return Object.entries(records).reduce<Record<string, CareDay>>((validRecords, [date, careDay]) => {
      if (isCareDay(careDay) && careDay.date === date) {
        validRecords[date] = {
          ...careDay,
          gardenPlan: careDay.gardenPlan === null ? null : normalizeGardenPlan(careDay.gardenPlan),
        };
      }

      return validRecords;
    }, {});
  } catch (error) {
    console.warn('Unable to restore Care day data.', error);
    return {};
  }
}

export function CareResponsesProvider({ children }: { children: ReactNode }) {
  const initialDay = useRef(createEmptyCareDay(getLocalCalendarDate())).current;
  const [activeDay, setActiveDay] = useState<CareDay>(initialDay);
  const [isReady, setIsReady] = useState(false);
  const activeDayRef = useRef(initialDay);
  const careDaysRef = useRef<Record<string, CareDay>>({});
  const isReadyRef = useRef(false);
  const writeQueue = useRef(Promise.resolve());
  const developmentDateOverride = useRef<string | null>(null);

  const getActiveDate = useCallback(() => {
    if (__DEV__ && developmentDateOverride.current) {
      return developmentDateOverride.current;
    }

    return getLocalCalendarDate();
  }, []);

  const persistCareDays = useCallback((careDays: Record<string, CareDay>) => {
    const serializedCareDays = JSON.stringify({ version: 1, records: careDays });

    writeQueue.current = writeQueue.current
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(CARE_DAYS_STORAGE_KEY, serializedCareDays))
      .catch((error) => {
        console.warn('Unable to save Care day data.', error);
      });
  }, []);

  const commitActiveDay = useCallback((nextDay: CareDay, shouldPersist = true) => {
    activeDayRef.current = nextDay;
    setActiveDay(nextDay);

    const nextCareDays = { ...careDaysRef.current, [nextDay.date]: nextDay };
    careDaysRef.current = nextCareDays;

    if (shouldPersist) {
      persistCareDays(nextCareDays);
    }
  }, [persistCareDays]);

  const activateDay = useCallback((date: string) => {
    if (!isReadyRef.current) {
      return false;
    }

    const existingDay = careDaysRef.current[date];
    const nextDay = existingDay ?? createEmptyCareDay(date);
    const hasChanged = activeDayRef.current.date !== date;

    if (!existingDay) {
      commitActiveDay(nextDay);
    } else if (hasChanged) {
      activeDayRef.current = nextDay;
      setActiveDay(nextDay);
    }

    return hasChanged;
  }, [commitActiveDay]);

  const ensureCurrentDay = useCallback(() => activateDay(getActiveDate()), [activateDay, getActiveDate]);

  const updateCurrentDay = useCallback((update: (careDay: CareDay) => CareDay) => {
    if (!isReadyRef.current) {
      return;
    }

    const date = getActiveDate();
    const currentDay = activeDayRef.current.date === date
      ? activeDayRef.current
      : careDaysRef.current[date] ?? createEmptyCareDay(date);

    commitActiveDay(update(currentDay));
  }, [commitActiveDay, getActiveDate]);

  useEffect(() => {
    let isCancelled = false;

    const restoreCareDay = async () => {
      const savedCareDays = await loadCareDays();
      if (isCancelled) {
        return;
      }

      careDaysRef.current = savedCareDays;
      const today = getActiveDate();
      const restoredDay = savedCareDays[today] ?? createEmptyCareDay(today);
      const nextCareDays = savedCareDays[today]
        ? savedCareDays
        : { ...savedCareDays, [today]: restoredDay };

      careDaysRef.current = nextCareDays;
      activeDayRef.current = restoredDay;
      setActiveDay(restoredDay);
      isReadyRef.current = true;
      setIsReady(true);

      if (!savedCareDays[today]) {
        persistCareDays(nextCareDays);
      }
    };

    void restoreCareDay();

    return () => {
      isCancelled = true;
    };
  }, [getActiveDate, persistCareDays]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        ensureCurrentDay();
      }
    });

    return () => subscription.remove();
  }, [ensureCurrentDay]);

  const value = useMemo<CareResponsesContextValue>(() => ({
    responses: {
      emotion: activeDay.emotion,
      sleepHours: activeDay.sleepHours,
      additionalFeelings: activeDay.additionalFeelings,
    },
    gardenPlan: activeDay.gardenPlan,
    careDate: activeDay.date,
    isReady,
    setEmotion: (emotion: CareEmotion) => {
      updateCurrentDay((currentDay) => ({ ...currentDay, emotion }));
    },
    setSleepHours: (sleepHours: number) => {
      updateCurrentDay((currentDay) => ({ ...currentDay, sleepHours }));
    },
    setAdditionalFeelings: (additionalFeelings: string) => {
      updateCurrentDay((currentDay) => ({ ...currentDay, additionalFeelings }));
    },
    setGardenPlan: (gardenPlan: GardenPlan) => {
      const normalizedPlan = normalizeGardenPlan(gardenPlan);
      if (!normalizedPlan) {
        return;
      }

      updateCurrentDay((currentDay) => ({ ...currentDay, gardenPlan: normalizedPlan }));
    },
    toggleTaskCompletion: (taskId: string) => {
      updateCurrentDay((currentDay) => {
        if (!currentDay.gardenPlan) {
          return currentDay;
        }

        return {
          ...currentDay,
          gardenPlan: {
            ...currentDay.gardenPlan,
            tasks: currentDay.gardenPlan.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task,
            ),
          },
        };
      });
    },
    completeTask: (taskId: string) => {
      updateCurrentDay((currentDay) => {
        if (!currentDay.gardenPlan) {
          return currentDay;
        }

        return {
          ...currentDay,
          gardenPlan: {
            ...currentDay.gardenPlan,
            tasks: currentDay.gardenPlan.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: true } : task,
            ),
          },
        };
      });
    },
    ensureCurrentDay,
    simulateNextDayForDevelopment: () => {
      if (!__DEV__) {
        return;
      }

      // Force a blank day, overwriting any stale record that may
      // already exist for this date from a previous development session.
      const nextDate = getNextCalendarDate(activeDayRef.current.date);
      developmentDateOverride.current = nextDate;
      commitActiveDay(createEmptyCareDay(nextDate));
    },
  }), [activateDay, activeDay, commitActiveDay, ensureCurrentDay, isReady, updateCurrentDay]);

  return <CareResponsesContext.Provider value={value}>{children}</CareResponsesContext.Provider>;
}

export function useCareResponses() {
  const context = useContext(CareResponsesContext);

  if (!context) {
    throw new Error('useCareResponses must be used inside CareResponsesProvider.');
  }

  return context;
}
