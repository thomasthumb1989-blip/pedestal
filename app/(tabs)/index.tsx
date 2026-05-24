import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

export default function PracticeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  function handleRecordPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.h1, styles.appName, { color: colors.text }]}>
        {STRINGS.APP_NAME}
      </Text>

      <View style={styles.recordArea}>
        <Pressable
          onPress={handleRecordPress}
          style={({ pressed }) => [
            styles.recordButton,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Ionicons name="mic" size={32} color="#FFFFFF" />
        </Pressable>

        <Text style={[Typography.body, styles.tapText, { color: colors.textSecondary }]}>
          {STRINGS.PRACTICE.TAP_TO_START}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  appName: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  recordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    marginTop: Spacing.lg,
  },
});
