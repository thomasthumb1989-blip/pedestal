import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { HeaderLogo } from '@/components/HeaderLogo';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import {
  generateDetailedTips,
  getFeedbackHeader,
  SpeechTip,
  TipSeverity,
} from '@/src/services/speechAnalysis';

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

function severityColor(severity: TipSeverity, colors: ColorTheme): string {
  if (severity === 'critical') return colors.error;
  if (severity === 'improvement') return colors.accent;
  return colors.success;
}

function severityIcon(severity: TipSeverity): keyof typeof Ionicons.glyphMap {
  if (severity === 'critical') return 'alert-circle';
  if (severity === 'improvement') return 'arrow-up-circle';
  return 'checkmark-circle';
}

function useAnimatedCount(target: number, duration: number = 800): number {
  const [display, setDisplay] = useState(0);
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listenerId = animVal.addListener(({ value }) => {
      setDisplay(Math.round(value));
    });
    Animated.timing(animVal, {
      toValue: target,
      duration,
      useNativeDriver: false,
    }).start();
    return () => {
      animVal.removeListener(listenerId);
    };
  }, [target]);

  return display;
}

type MetricCardProps = {
  label: string;
  value: number;
  displayOverride?: string;
  subtitle?: string;
  valueColor: string;
  colors: ColorTheme;
  animStyle?: object;
};

function MetricCard({ label, value, displayOverride, subtitle, valueColor, colors, animStyle }: MetricCardProps) {
  const counted = useAnimatedCount(value);
  const shown = displayOverride ?? counted.toString();

  return (
    <Animated.View style={[styles.metricCard, { backgroundColor: colors.surfaceElevated }, Shadows.card, animStyle]}>
      <Text style={[Typography.h1, { color: valueColor }]}>{shown}</Text>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
        {label}
      </Text>
      {subtitle && (
        <Text style={[Typography.caption, { color: colors.textTertiary, marginTop: 2 }]}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}

function ClarityRing({ score, color, colors }: { score: number; color: string; colors: ColorTheme }) {
  const pct = Math.min(score, 100) / 100;
  const counted = useAnimatedCount(score);
  const SIZE = 120;
  const BORDER = 6;
  const HALF = SIZE / 2;

  // Semi-circle rotation technique for circular progress
  // Left half covers 0-50%, right half covers 50-100%
  const rightDeg = pct <= 0.5 ? pct * 360 : 180;
  const leftDeg = pct > 0.5 ? (pct - 0.5) * 360 : 0;

  return (
    <View style={styles.clarityHero}>
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        {/* Base circle (track) */}
        <View style={{
          width: SIZE,
          height: SIZE,
          borderRadius: HALF,
          borderWidth: BORDER,
          borderColor: colors.border,
          position: 'absolute',
        }} />

        {/* Right half (0-180deg) */}
        <View style={{
          width: HALF,
          height: SIZE,
          position: 'absolute',
          right: 0,
          overflow: 'hidden',
        }}>
          <View style={{
            width: SIZE,
            height: SIZE,
            borderRadius: HALF,
            borderWidth: BORDER,
            borderColor: color,
            position: 'absolute',
            right: 0,
            transform: [{ rotate: `${rightDeg}deg` }],
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
          }} />
        </View>

        {/* Left half (180-360deg) */}
        {pct > 0.5 && (
          <View style={{
            width: HALF,
            height: SIZE,
            position: 'absolute',
            left: 0,
            overflow: 'hidden',
          }}>
            <View style={{
              width: SIZE,
              height: SIZE,
              borderRadius: HALF,
              borderWidth: BORDER,
              borderColor: color,
              position: 'absolute',
              left: 0,
              transform: [{ rotate: `${leftDeg}deg` }],
              borderRightColor: 'transparent',
              borderTopColor: 'transparent',
            }} />
          </View>
        )}

        {/* Score number */}
        <Text style={{ fontSize: 48, fontWeight: '700', color }}>{counted}</Text>
      </View>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
        {STRINGS.RESULTS.CLARITY_SCORE}
      </Text>
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
          style={{
            color: colors.error,
            fontWeight: '600',
            backgroundColor: colors.error + '20',
            borderRadius: 4,
            paddingHorizontal: 2,
            overflow: 'hidden',
          }}
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

  const tips = generateDetailedTips(transcript, {
    clarityScore,
    wordsPerMinute: wpm,
    totalWords: parseInt(params.totalWords ?? '0', 10),
    fillerCount,
    fillerPercentage,
    fillerPositions: [],
    tooShort: false,
  });
  const feedbackHeader = getFeedbackHeader(clarityScore);

  // Staggered fade-in for the 3 metric cards (WPM, Filler, Duration)
  const card0Opacity = useRef(new Animated.Value(0)).current;
  const card0TransY = useRef(new Animated.Value(20)).current;
  const card1Opacity = useRef(new Animated.Value(0)).current;
  const card1TransY = useRef(new Animated.Value(20)).current;
  const card2Opacity = useRef(new Animated.Value(0)).current;
  const card2TransY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(card0Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(card0TransY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(card1TransY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(card2TransY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Tips slide-up animation
  const tipsTransY = useRef(new Animated.Value(40)).current;
  const tipsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showTips) {
      Animated.parallel([
        Animated.spring(tipsTransY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(tipsOpacity, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showTips]);

  const cardStyles = [
    { opacity: card0Opacity, transform: [{ translateY: card0TransY }] },
    { opacity: card1Opacity, transform: [{ translateY: card1TransY }] },
    { opacity: card2Opacity, transform: [{ translateY: card2TransY }] },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={[Typography.h1, { color: colors.text, flex: 1 }]}>
          {STRINGS.RESULTS.TITLE}
        </Text>
        <HeaderLogo size={32} />
      </View>

      {/* Celebration badge */}
      {clarityScore >= 80 && (
        <View style={[styles.celebrationBadge, { backgroundColor: colors.accent + '20' }]}>
          <Ionicons name="star" size={16} color={colors.accent} />
          <Text style={[Typography.caption, { color: colors.accent, fontWeight: '600', marginLeft: Spacing.xs }]}>
            Great job!
          </Text>
        </View>
      )}

      {/* Clarity Score Hero */}
      <ClarityRing
        score={clarityScore}
        color={getScoreColor(clarityScore, colors)}
        colors={colors}
      />

      {/* Remaining 3 metric cards in a grid */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label={STRINGS.RESULTS.WORDS_PER_MINUTE}
          value={wpm}
          subtitle={STRINGS.RESULTS.WPM_GOOD}
          valueColor={getWpmColor(wpm, colors)}
          colors={colors}
          animStyle={cardStyles[0]}
        />
        <MetricCard
          label={STRINGS.RESULTS.FILLER_WORDS}
          value={fillerCount}
          subtitle={`${fillerPercentage}%`}
          valueColor={getFillerColor(fillerPercentage, colors)}
          colors={colors}
          animStyle={cardStyles[1]}
        />
        <MetricCard
          label={STRINGS.RESULTS.DURATION}
          value={durationSeconds}
          displayOverride={formatDuration(durationSeconds)}
          valueColor={colors.text}
          colors={colors}
          animStyle={cardStyles[2]}
        />
      </View>

      <View style={[styles.transcriptCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
          {STRINGS.RESULTS.TRANSCRIPT_TITLE}
        </Text>
        <HighlightedTranscript transcript={transcript} colors={colors} />
      </View>

      {showTips && (
        <Animated.View style={[
          styles.tipsCard,
          { backgroundColor: colors.surfaceElevated },
          Shadows.card,
          { opacity: tipsOpacity, transform: [{ translateY: tipsTransY }] },
        ]}>
          {/* Feedback header */}
          <View style={[styles.feedbackHeader, { backgroundColor: colors.primaryLight }]}>
            <Ionicons
              name={clarityScore >= 75 ? 'thumbs-up' : 'fitness'}
              size={20}
              color={colors.primary}
            />
            <Text style={[Typography.h3, { color: colors.primary, marginLeft: Spacing.sm, flex: 1 }]}>
              {feedbackHeader}
            </Text>
          </View>

          <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
            {STRINGS.RESULTS.TIPS_TITLE}
          </Text>

          {tips.map((tip, i) => {
            const color = severityColor(tip.severity, colors);
            const icon = severityIcon(tip.severity);
            return (
              <View key={i} style={[styles.tipCard, { borderLeftColor: color }]}>
                <View style={styles.tipHeader}>
                  <Ionicons name={icon} size={18} color={color} />
                  <Text style={[Typography.body, { color, fontWeight: '700', marginLeft: Spacing.xs }]}>
                    {tip.label}
                  </Text>
                </View>
                <Text style={[Typography.body, { color: colors.text, marginTop: 4 }]}>
                  {tip.detail}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' }]}>
                  {tip.fix}
                </Text>
              </View>
            );
          })}
        </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  clarityHero: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
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
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  tipCard: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
