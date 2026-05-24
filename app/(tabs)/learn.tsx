import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { DRILL_CATEGORIES, getDrillsByCategory, DrillCategoryInfo, DrillDifficulty } from '@/src/constants/drills';

function difficultyColor(difficulty: DrillDifficulty, colors: ColorTheme): string {
  if (difficulty === 'Beginner') return colors.success;
  if (difficulty === 'Intermediate') return colors.warning;
  return colors.error;
}

type CategoryCardProps = {
  category: DrillCategoryInfo;
  colors: ColorTheme;
  onPress: () => void;
};

function CategoryCard({ category, colors, onPress }: CategoryCardProps) {
  const drills = getDrillsByCategory(category.id);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.categoryCard,
        { backgroundColor: colors.surfaceElevated, opacity: pressed ? 0.7 : 1 },
        Shadows.card,
      ]}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons
            name={category.icon as any}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.categoryText}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {category.title}
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {category.description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>

      <View style={styles.drillPills}>
        {drills.map((drill) => (
          <View
            key={drill.id}
            style={[
              styles.difficultyPill,
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
        ))}
      </View>
    </Pressable>
  );
}

export default function LearnScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[Typography.h1, styles.title, { color: colors.text }]}>
        {STRINGS.LEARN.TITLE}
      </Text>

      {DRILL_CATEGORIES.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          colors={colors}
          onPress={() => router.push({
            pathname: '/drills',
            params: { category: category.id },
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
  title: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  categoryCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  drillPills: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    marginLeft: 60,
  },
  difficultyPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
});
