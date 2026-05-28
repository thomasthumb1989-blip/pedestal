import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { PaywallGate } from '@/components/PaywallGate';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { useSubscription } from '@/src/hooks/useSubscription';
import { DRILL_CATEGORIES, getDrillsByCategory, DrillCategoryInfo, DrillDifficulty } from '@/src/constants/drills';

function difficultyColor(difficulty: DrillDifficulty, colors: ColorTheme): string {
  if (difficulty === 'Beginner') return colors.success;
  if (difficulty === 'Intermediate') return colors.warning;
  return colors.error;
}

const ACCENT_COLORS: ((c: ColorTheme) => string)[] = [
  (c) => c.primary,
  (c) => c.accent,
  (c) => c.success,
  (c) => c.warning,
  (c) => c.warning,
];

type CategoryCardProps = {
  category: DrillCategoryInfo;
  colors: ColorTheme;
  accentColor: string;
  onPress: () => void;
};

function CategoryCard({ category, colors, accentColor, onPress }: CategoryCardProps) {
  const drills = getDrillsByCategory(category.id);

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.categoryCard,
        { backgroundColor: colors.surfaceElevated, transform: [{ scale: pressed ? 0.97 : 1 }] },
        Shadows.card,
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons
            name={category.icon as any}
            size={28}
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
        <View style={styles.chevronRow}>
          <Text style={[Typography.caption, { color: colors.textTertiary }]}>{drills.length} drills</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
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
  const { isSubscribed, isLoading: subLoading } = useSubscription();

  const fadeAnims = useRef(
    DRILL_CATEGORIES.map(() => new Animated.Value(0))
  ).current;
  const slideAnims = useRef(
    DRILL_CATEGORIES.map(() => new Animated.Value(20))
  ).current;

  useEffect(() => {
    DRILL_CATEGORIES.forEach((_, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnims[i], {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnims[i], {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }, i * 120);
    });
  }, []);

  if (!subLoading && !isSubscribed) {
    return <PaywallGate />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[Typography.h1, styles.title, { color: colors.text }]}>
        {STRINGS.LEARN.TITLE}
      </Text>
      <Text style={[Typography.body, styles.subtitle, { color: colors.textSecondary }]}>
        Master your speaking skills
      </Text>

      {DRILL_CATEGORIES.map((category, index) => (
        <Animated.View
          key={category.id}
          style={{
            opacity: fadeAnims[index],
            transform: [{ translateY: slideAnims[index] }],
          }}
        >
          <CategoryCard
            category={category}
            colors={colors}
            accentColor={(ACCENT_COLORS[index] || ACCENT_COLORS[3])(colors)}
            onPress={() => router.push({
              pathname: '/drills',
              params: { category: category.id },
            })}
          />
        </Animated.View>
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.md,
  },
  categoryCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  chevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drillPills: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    marginLeft: 68,
  },
  difficultyPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
});
