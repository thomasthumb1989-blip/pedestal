import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.emptyState}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="bar-chart-outline" size={36} color={colors.primary} />
        </View>
        <Text style={[Typography.h3, styles.emptyTitle, { color: colors.text }]}>
          {STRINGS.PROGRESS.EMPTY_TITLE}
        </Text>
        <Text style={[Typography.body, styles.emptyBody, { color: colors.textSecondary }]}>
          {STRINGS.PROGRESS.EMPTY_BODY}
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyBody: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
