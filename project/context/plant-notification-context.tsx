import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlantNotificationType = 'task-completed' | 'plan-completed' | 'growth';

export interface PlantNotification {
  id: number;
  message: string;
  type: PlantNotificationType;
}

interface PlantNotificationContextValue {
  notification: PlantNotification | null;
  showPlantNotification: (
    message: string,
    type: PlantNotificationType,
    durationMs?: number,
  ) => void;
  hidePlantNotification: () => void;
  taskNotificationsEnabled: boolean;
  planNotificationsEnabled: boolean;
  setTaskNotificationsEnabled: (enabled: boolean) => void;
  setPlanNotificationsEnabled: (enabled: boolean) => void;
}

const PlantNotificationContext = createContext<PlantNotificationContextValue | undefined>(undefined);
const NOTIFICATION_PREFERENCES_STORAGE_KEY = '@rooted/plant-notification-preferences';

type PlantNotificationPreferences = {
  taskNotificationsEnabled: boolean;
  planNotificationsEnabled: boolean;
};

export function PlantNotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<PlantNotification | null>(null);
  const [taskNotificationsEnabled, setTaskNotificationsEnabledState] = useState(true);
  const [planNotificationsEnabled, setPlanNotificationsEnabledState] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIdRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hidePlantNotification = useCallback(() => {
    clearTimer();
    setNotification(null);
  }, [clearTimer]);

  useEffect(() => {
    let isActive = true;

    void AsyncStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY).then((storedPreferences) => {
      if (!isActive || !storedPreferences) {
        return;
      }

      try {
        const preferences = JSON.parse(storedPreferences) as Partial<PlantNotificationPreferences>;
        if (typeof preferences.taskNotificationsEnabled === 'boolean') {
          setTaskNotificationsEnabledState(preferences.taskNotificationsEnabled);
        }
        if (typeof preferences.planNotificationsEnabled === 'boolean') {
          setPlanNotificationsEnabledState(preferences.planNotificationsEnabled);
        }
      } catch {
        // Ignore malformed preferences and keep notifications enabled.
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const savePreferences = useCallback((preferences: PlantNotificationPreferences) => {
    void AsyncStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }, []);

  const setTaskNotificationsEnabled = useCallback((enabled: boolean) => {
    setTaskNotificationsEnabledState(enabled);
    savePreferences({ taskNotificationsEnabled: enabled, planNotificationsEnabled });
  }, [planNotificationsEnabled, savePreferences]);

  const setPlanNotificationsEnabled = useCallback((enabled: boolean) => {
    setPlanNotificationsEnabledState(enabled);
    savePreferences({ taskNotificationsEnabled, planNotificationsEnabled: enabled });
  }, [savePreferences, taskNotificationsEnabled]);

  const showPlantNotification = useCallback((
    message: string,
    type: PlantNotificationType,
    durationMs = 5_500,
  ) => {
    if (type === 'task-completed' && !taskNotificationsEnabled) {
      return;
    }
    if (type === 'plan-completed' && !planNotificationsEnabled) {
      return;
    }

    clearTimer();
    nextIdRef.current += 1;
    setNotification({ id: nextIdRef.current, message, type });
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setNotification(null);
    }, durationMs);
  }, [clearTimer, planNotificationsEnabled, taskNotificationsEnabled]);

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(() => ({
    notification,
    showPlantNotification,
    hidePlantNotification,
    taskNotificationsEnabled,
    planNotificationsEnabled,
    setTaskNotificationsEnabled,
    setPlanNotificationsEnabled,
  }), [
    hidePlantNotification,
    notification,
    planNotificationsEnabled,
    setPlanNotificationsEnabled,
    setTaskNotificationsEnabled,
    showPlantNotification,
    taskNotificationsEnabled,
  ]);

  return (
    <PlantNotificationContext.Provider value={value}>
      {children}
    </PlantNotificationContext.Provider>
  );
}

export function usePlantNotification() {
  const context = useContext(PlantNotificationContext);

  if (!context) {
    throw new Error('usePlantNotification must be used inside PlantNotificationProvider.');
  }

  return context;
}
