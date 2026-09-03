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
}

const PlantNotificationContext = createContext<PlantNotificationContextValue | undefined>(undefined);

export function PlantNotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<PlantNotification | null>(null);
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

  const showPlantNotification = useCallback((
    message: string,
    type: PlantNotificationType,
    durationMs = 5_500,
  ) => {
    clearTimer();
    nextIdRef.current += 1;
    setNotification({ id: nextIdRef.current, message, type });
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setNotification(null);
    }, durationMs);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(() => ({
    notification,
    showPlantNotification,
    hidePlantNotification,
  }), [hidePlantNotification, notification, showPlantNotification]);

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
