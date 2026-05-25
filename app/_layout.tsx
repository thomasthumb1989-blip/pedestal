import 'react-native-reanimated';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { useColorScheme } from '@/components/useColorScheme';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { Colors } from '@/constants/Colors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <RootLayoutNav />
    </AppErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="results" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="drills" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="drill" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="impromptu" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="paywall" options={{ animation: 'fade' }} />
    </Stack>
  );
}
