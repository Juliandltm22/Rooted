import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type TabNavigation = {
  addListener: (event: 'tabPress', listener: (event: { target?: string; preventDefault: () => void }) => void) => () => void;
  getState: () => { index: number; routes: TabRoute[] };
  navigate: (name: string, params?: object) => void;
};

interface UseGuidedNavigationGuardOptions {
  isSessionUnfinished: boolean;
  onLeaveSession: () => void;
}

/**
 * Owns every in-app exit path for a guided session. It captures the original
 * navigation action, waits for the shared confirmation UI, and only dispatches
 * it after the session has been cancelled and audio has stopped.
 */
export function useGuidedNavigationGuard({
  isSessionUnfinished,
  onLeaveSession,
}: UseGuidedNavigationGuardOptions) {
  const navigation = useNavigation();
  const [isExitConfirmationVisible, setIsExitConfirmationVisible] = useState(false);
  const isSessionUnfinishedRef = useRef(isSessionUnfinished);
  const onLeaveSessionRef = useRef(onLeaveSession);
  const isConfirmingRef = useRef(false);
  const isExitingRef = useRef(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  isSessionUnfinishedRef.current = isSessionUnfinished;
  onLeaveSessionRef.current = onLeaveSession;

  const requestExit = useCallback((navigateAfterLeave?: () => void) => {
    if (!isSessionUnfinishedRef.current) {
      navigateAfterLeave?.();
      return;
    }

    if (isConfirmingRef.current || isExitingRef.current) {
      return;
    }

    isConfirmingRef.current = true;
    pendingNavigationRef.current = navigateAfterLeave ?? null;
    setIsExitConfirmationVisible(true);
  }, []);

  const stayInSession = useCallback(() => {
    if (!isConfirmingRef.current) {
      return;
    }

    pendingNavigationRef.current = null;
    isConfirmingRef.current = false;
    setIsExitConfirmationVisible(false);
  }, []);

  const leaveSession = useCallback(() => {
    if (!isConfirmingRef.current || isExitingRef.current) {
      return;
    }

    const pendingNavigation = pendingNavigationRef.current;
    isConfirmingRef.current = false;
    isExitingRef.current = true;
    pendingNavigationRef.current = null;
    setIsExitConfirmationVisible(false);
    onLeaveSessionRef.current();

    pendingNavigation?.();
  }, []);

  /** Allows an internal redirect, such as an expired Care day, without a prompt. */
  const allowNextNavigation = useCallback(() => {
    isExitingRef.current = true;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!isSessionUnfinishedRef.current || isExitingRef.current) {
        return;
      }

      event.preventDefault();
      requestExit(() => navigation.dispatch(event.data.action));
    });

    return unsubscribe;
  }, [navigation, requestExit]);

  useEffect(() => {
    const parentNavigation = navigation.getParent() as unknown as TabNavigation | undefined;
    if (!parentNavigation) {
      return;
    }

    return parentNavigation.addListener('tabPress', (event) => {
      if (!isSessionUnfinishedRef.current || isExitingRef.current) {
        return;
      }

      const tabState = parentNavigation.getState();
      const destination = tabState.routes.find((route) => route.key === event.target);
      const currentTab = tabState.routes[tabState.index];
      if (!destination || destination.key === currentTab?.key) {
        return;
      }

      event.preventDefault();
      requestExit(() => {
        // Tab changes do not remove the nested Care route, so replace it first
        // to avoid returning to an abandoned session when Care is selected again.
        navigation.dispatch(StackActions.replace('agent'));
        setTimeout(() => parentNavigation.navigate(destination.name, destination.params), 0);
      });
    });
  }, [navigation, requestExit]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isSessionUnfinishedRef.current || isExitingRef.current) {
        return false;
      }

      requestExit(() => navigation.goBack());
      return true;
    });

    return () => subscription.remove();
  }, [navigation, requestExit]);

  return {
    isExitConfirmationVisible,
    requestExit,
    stayInSession,
    leaveSession,
    allowNextNavigation,
  };
}
