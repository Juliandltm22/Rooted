import { useCallback, useEffect, useRef, useState } from 'react';

export type GuidedSessionStatus = 'ready' | 'running' | 'paused' | 'completed' | 'cancelled';

interface UseGuidedSessionOptions {
  durationSeconds: number;
  onComplete: () => void;
}

export function useGuidedSession({ durationSeconds, onComplete }: UseGuidedSessionOptions) {
  const [status, setStatus] = useState<GuidedSessionStatus>('ready');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const elapsedBeforeStartRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const getElapsedSeconds = useCallback(() => {
    if (startedAtRef.current === null) {
      return elapsedBeforeStartRef.current;
    }

    const wallClockElapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
    return Math.min(durationSeconds, elapsedBeforeStartRef.current + Math.max(0, wallClockElapsed));
  }, [durationSeconds]);

  const tick = useCallback(() => {
    const nextElapsedSeconds = getElapsedSeconds();
    setElapsedSeconds((currentElapsedSeconds) =>
      currentElapsedSeconds === nextElapsedSeconds ? currentElapsedSeconds : nextElapsedSeconds,
    );

    if (nextElapsedSeconds >= durationSeconds && !completedRef.current) {
      completedRef.current = true;
      elapsedBeforeStartRef.current = durationSeconds;
      startedAtRef.current = null;
      setStatus('completed');
      onCompleteRef.current();
    }
  }, [durationSeconds, getElapsedSeconds]);

  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [status, tick]);

  const start = useCallback(() => {
    if (status !== 'ready') {
      return false;
    }

    startedAtRef.current = Date.now();
    setStatus('running');
    return true;
  }, [status]);

  const pause = useCallback(() => {
    if (status !== 'running') {
      return;
    }

    const nextElapsedSeconds = getElapsedSeconds();
    elapsedBeforeStartRef.current = nextElapsedSeconds;
    startedAtRef.current = null;
    setElapsedSeconds(nextElapsedSeconds);
    setStatus('paused');
  }, [getElapsedSeconds, status]);

  const resume = useCallback(() => {
    if (status !== 'paused') {
      return;
    }

    startedAtRef.current = Date.now();
    setStatus('running');
  }, [status]);

  /** Stops the clock without completing the task. Used only for an intentional exit. */
  const cancel = useCallback(() => {
    if (status === 'completed' || status === 'cancelled') {
      return;
    }

    startedAtRef.current = null;
    setStatus('cancelled');
  }, [status]);

  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

  return {
    status,
    elapsedSeconds,
    remainingSeconds,
    start,
    pause,
    resume,
    cancel,
  };
}
