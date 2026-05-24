import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

const FILLER_WORDS_SET = new Set([
  'um', 'uh', 'like', 'you know', 'so', 'basically',
  'actually', 'right', 'er', 'ah',
]);

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getScoreColor(score: number, colors: ColorTheme): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.error;
}

function getWpmColor(wpm: number, colors: ColorTheme): string {
  if (wpm >= 130 && wpm <= 160) return colors.success;
  if (wpm >= 110 && wpm <= 180) return colors.warning;
  return colors.error;
}

function getFillerColor(percentage: number, colors: ColorTheme): string {
  if (percentage <= 3) return colors.success;
  if (percentage <= 5) return colors.warning;
  return colors.error;
}

function generateTips(clarityScore: number, wpm: number, fillerPercentage: number): string[] {
  const tips: string[] = [];

  if (fillerPercentage > 5) {
    tips.push(STRINGS.RESULTS.TIP_FILLERS);
  }

  if (wpm > 160) {
    tips.push(STRINGS.RESULTS.TIP_SLOW_DOWN);
  } else if (wpm < 110) {
    tips.push(STRINGS.RESULTS.TIP_SPEED_UP);
  } else {
    tips.push(STRINGS.RESULTS.TIP_GOOD_PACE);
  }

  if (clarityScore >= 80 && fillerPercentage <= 5) {
    tips.push(STRINGS.RESULTS.TIP_CLARITY);
  }

  return tips.slice(0, 3);
}

type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  valueColor: string;
  colors: ColorTheme;
};

function MetricCard({ label, value, subtitle, valueColor, colors }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
      <Text style={[Typography.h1, { color: valueColor }]}>{value}</Text>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
        {label}
      </Text>
      {subtitle && (
        <Text style={[Typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function HighlightedTranscript({ transcript, colors }: { transcript: string; colors: ColorTheme }) {
  const words = transcript.split(/(\s+)/);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (/^\s+$/.test(word)) {
      elements.push(<Text key={`s-${i}`}>{word}</Text>);
      continue;
    }

    const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const isFiller = FILLER_WORDS_SET.has(lower);

    if (isFiller) {
      elements.push(
        <Text
          key={`w-${i}`}
          style={{ color: colors.error, fontWeight: '600' }}
        >
          {word}
        </Text>,
      );
    } else {
      elements.push(
        <Text key={`w-${i}`} style={{ color: colors.text }}>
          {word}
        </Text>,
      );
    }
  }

  return (
    <Text style={[Typography.body, { lineHeight: 26 }]}>
      {elements}
    </Text>
  );
}

export default function ResultsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    transcript: string;
    durationSeconds: string;
    clarityScore: string;
    wordsPerMinute: string;
    fillerCount: string;
    fillerPercentage: string;
    totalWords: string;
  }>();

  const [showTips, setShowTips] = useState(false);

  const clarityScore = parseInt(params.clarityScore ?? '0', 10);
  const wpm = parseInt(params.wordsPerMinute ?? '0', 10);
  const fillerCount = parseInt(params.fillerCount ?? '0', 10);
  const fillerPercentage = parseFloat(params.fillerPercentage ?? '0');
  const durationSeconds = parseInt(params.durationSeconds ?? '0', 10);
  const transcript = params.transcript ?? '';

  const tips = generateTips(clarityScore, wpm, fillerPercentage);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={[Typography.h1, { color: colors.text }]}>
          {STRINGS.RESULTS.TITLE}
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          label={STRINGS.RESULTS.CLARITY_SCORE}
          value={clarityScore.toString()}
          valueColor={getScoreColor(clarityScore, colors)}
          colors={colors}
        />
        <MetricCard
          label={STRINGS.RESULTS.WORDS_PER_MINUTE}
          value={wpm.toString()}
          subtitle={STRINGS.RESULTS.WPM_GOOD}
          valueColor={getWpmColor(wpm, colors)}
          colors={colors}
        />
        <MetricCard
          label={STRINGS.RESULTS.FILLER_WORDS}
          value={fillerCount.toString()}
          subtitle={`${fillerPercentage}%`}
          valueColor={getFillerColor(fillerPercentage, colors)}
          colors={colors}
        />
        <MetricCard
          label={STRINGS.RESULTS.DURATION}
          value={formatDuration(durationSeconds)}
          valueColor={colors.text}
          colors={colors}
        />
      </View>

      <View style={[styles.transcriptCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
          {STRINGS.RESULTS.TRANSCRIPT_TITLE}
        </Text>
        <HighlightedTranscript transcript={transcript} colors={colors} />
      </View>

      {showTips && (
        <View style={[styles.tipsCard, { backgroundColor: colors.primaryLight }, Shadows.card]}>
          <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
            {STRINGS.RESULTS.TIPS_TITLE}
          </Text>
          {tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="bulb-outline" size={18} color={colors.accent} />
              <Text style={[Typography.body, { color: colors.text, flex: 1, marginLeft: Spacing.sm }]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttons}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace('/(tabs)');
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Text style={[Typography.button, { color: '#FFFFFF', textTransform: 'uppercase' }]}>
            {STRINGS.RESULTS.PRACTICE_AGAIN}
          </Text>
        </Pressable>

        {!showTips && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTips(true);
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: colors.primary,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[Typography.button, { color: colors.primary }]}>
              {STRINGS.RESULTS.VIEW_TIPS}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  transcriptCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipsCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  buttons: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
