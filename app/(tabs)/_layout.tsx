import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { HeaderLogo } from '@/components/HeaderLogo';
import { Colors, Spacing } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

const ONBOARDING_KEY = '@pedestal_onboarding_complete';
const SUBSCRIPTION_KEY = '@pedestal_subscribed';

// Module-level flag: resets on app restart, persists across remounts within session
let _paywallShownThisSession = false;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const onboarded = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (onboarded !== 'true') {
        router.replace('/onboarding');
        setReady(true);
        return;
      }

      const subscribed = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
      if (subscribed !== 'true' && !_paywallShownThisSession) {
        _paywallShownThisSession = true;
        router.replace('/paywall');
        setReady(true);
        return;
      }

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
