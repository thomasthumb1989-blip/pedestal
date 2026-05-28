import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { HeaderLogo } from '@/components/HeaderLogo';
import { Colors, Spacing } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { STORAGE_KEYS } from '@/src/constants/storageKeys';

// Resets on app kill/reopen — paywall shows once per launch, not in a loop
let _paywallShownThisSession = false;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

async function maybePromptReview() {
  try {
    const alreadyPrompted = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_PROMPTED);
    if (alreadyPrompted === 'true') return;

    let firstSubDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_SUBSCRIBED_DATE);
    if (!firstSubDate) {
      firstSubDate = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_SUBSCRIBED_DATE, firstSubDate);
      return;
    }

    const elapsed = Date.now() - new Date(firstSubDate).getTime();
    if (elapsed >= SEVEN_DAYS_MS) {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
        await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_PROMPTED, 'true');
      }
    }
  } catch {
    // Silent — review prompt is non-critical
  }
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const onboarded = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
      if (onboarded !== 'true') {
        router.replace('/onboarding');
        setReady(true);
        return;
      }

      const subscribed = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (subscribed === 'true') {
        // Subscriber — full access, maybe prompt review
        maybePromptReview();
        setReady(true);
        return;
      }

      // Not subscribed — show paywall once per launch
      if (!_paywallShownThisSession) {
        _paywallShownThisSession = true;
        router.replace('/paywall');
        setReady(true);
        return;
      }

      // Paywall already shown this session — let user into limited tabs
      setReady(true);
    }
    init();
  }, []);

  if (!ready) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
          paddingTop: Spacing.sm,
          height: 64 + Math.max(insets.bottom, Spacing.sm),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
          marginTop: 2,
          paddingBottom: 2,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerRight: () => <HeaderLogo />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: STRINGS.TABS.PRACTICE,
          tabBarLabel: STRINGS.TABS.PRACTICE,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'mic' : 'mic-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: STRINGS.LEARN.TITLE,
          tabBarLabel: STRINGS.TABS.LEARN,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: STRINGS.PROGRESS.TITLE,
          tabBarLabel: STRINGS.TABS.PROGRESS,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: STRINGS.SETTINGS.TITLE,
          tabBarLabel: STRINGS.TABS.SETTINGS,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
