import { useEffect, useState } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

const ONBOARDING_KEY = '@pedestal_onboarding_complete';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (value !== 'true') {
        router.replace('/onboarding');
      }
      setCheckedOnboarding(true);
    });
  }, []);

  if (!checkedOnboarding) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: STRINGS.TABS.PRACTICE,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'mic' : 'mic-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) =>
            focused ? STRINGS.TABS.PRACTICE : undefined,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: STRINGS.PROGRESS.TITLE,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) =>
            focused ? STRINGS.TABS.PROGRESS : undefined,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: STRINGS.LEARN.TITLE,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) =>
            focused ? STRINGS.TABS.LEARN : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: STRINGS.SETTINGS.TITLE,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) =>
            focused ? STRINGS.TABS.SETTINGS : undefined,
        }}
      />
    </Tabs>
  );
}
