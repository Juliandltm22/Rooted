import { Stack } from 'expo-router';
import { CareResponsesProvider, useCareResponses } from './care-responses';

export default function CareLayout() {
  return (
    <CareResponsesProvider>
      <CareNavigator />
    </CareResponsesProvider>
  );
}

function CareNavigator() {
  const { isReady } = useCareResponses();

  if (!isReady) {
    return null;
  }

  return (
      <Stack screenOptions={{ headerShown: false }} />
  );
}
