import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Stack } from "expo-router";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Caveat-Regular': require('../assets/fonts/Caveat-Regular.ttf'),
    'Caveat-SemiBold': require('../assets/fonts/Caveat-SemiBold.ttf'),
    'Caveat-Bold': require('../assets/fonts/Caveat-Bold.ttf'),
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-SemiBold': require('../assets/fonts/Raleway-SemiBold.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
    'Harmattan-Regular': require('../assets/fonts/Harmattan-Regular.ttf'),
    'Harmattan-SemiBold': require('../assets/fonts/Harmattan-SemiBold.ttf'),
    'Harmattan-Bold': require('../assets/fonts/Harmattan-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="(auth)" />
  </Stack>;
}
