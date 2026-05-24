import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { HeaderLogo } from '@/components/HeaderLogo';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import {
  getDrillsByCategory,
  DRILL_CATEGORIES,
  Drill,
  DrillCategory,
  DrillDifficulty,
} from '@/src/constants/drills';

function difficultyColor(difficulty: DrillDifficulty, colors: ColorTheme): string {
  if (difficulty === 'Beginner') return colors.success;
  if (difficulty === 'Intermediate') return colors.warning;
  return colors.error;
}

type DrillRowProps = {
  drill: Drill;
  colors: ColorTheme;
  onPress: () => void;
};

function DrillRow({ drill, colors, onPress }: DrillRowProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.drillRow,
        { backgroundColor: colors.surfaceElevated, opacity: pressed ? 0.7 : 1 },
        Shadows.card,
      ]}
    >
      <View style={styles.drillInfo}>
        <Text style={[Typography.h3, { color: colors.text }]}>{drill.title}</Text>
        <Text
          style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}
          numberOfLines={2}
        >
          {drill.tip}
        </Text>
      </View>

      <View style={styles.drillRight}>
        <View
          style={[
            styles.badge,
            { backgroundColor: difficultyColor(drill.difficulty, colors) + '20' },
          ]}
        >
          <Text
            style={[
              Typography.caption,
              { color: difficultyColor(drill.difficulty, colors), fontWeight: '600' },
            ]}
          >
            {drill.difficulty}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

export default function DrillsListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();

  const categoryInfo = DRILL_CATEGORIES.find((c) => c.id === category);
  const drills = getDrillsByCategory((category ?? 'fillers') as DrillCategory);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: insets.top + Spacing.md }}>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
            <Text style={[Typography.body, { color: colors.primary }]}>Back</Text>
          </Pressable>
          <HeaderLogo size={32} />
        </View>

        <Text style={[Typography.h1, styles.title, { color: colors.text }]}>
          {categoryInfo?.title ?? 'Drills'}
        </Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
          {categoryInfo?.description ?? ''}
        </Text>
      </View>

      {drills.map((drill) => (
        <DrillRow
          key={drill.id}
          drill={drill}
          colors={colors}
          onPress={() => router.push({
            pathname: '/drill',
            params: { drillId: drill.id },
          })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  drillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  drillInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  drillRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
});
