import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { useSessionHistory, Session } from '@/src/hooks/useSessionHistory';

function formatPracticeTime(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const mins = Math.floor(totalSeconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSessionDate(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getScoreColor(score: number, colors: ColorTheme): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.error;
}

// ── Summary stat ──────────────────────────────────

type StatProps = {
  label: string;
  value: string;
  valueColor?: string;
  colors: ColorTheme;
  accentColor?: string;
  trend?: 'up' | 'down' | 'none';
};

function StatCard({ label, value, valueColor, colors, accentColor, trend }: StatProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated, overflow: 'hidden' as const }, Shadows.card]}>
      {accentColor && (
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      )}
      <View style={styles.statValueRow}>
        <Text style={[Typography.h2, { color: valueColor ?? colors.text }]}>{value}</Text>
        {trend === 'up' && (
          <Ionicons name="arrow-up" size={12} color={colors.success} style={{ marginLeft: 4 }} />
        )}
        {trend === 'down' && (
          <Ionicons name="arrow-down" size={12} color={colors.error} style={{ marginLeft: 4 }} />
        )}
      </View>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Clarity chart (pure RN absolute positioning) ──

const CHART_HEIGHT = 160;
const Y_LABELS = [0, 25, 50, 75, 100];
const Y_LABEL_WIDTH = 28;
const DOT_SIZE = 12;

function formatChartDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
}

function ClarityChart({ sessions, colors }: { sessions: Session[]; colors: ColorTheme }) {
  const [chartWidth, setChartWidth] = useState(0);

  // Single session — show dot + message
  if (sessions.length === 1) {
    const s = sessions[0];
    return (
      <View style={[styles.chartCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
          {STRINGS.PROGRESS.IMPROVEMENT}
        </Text>
        <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
          <View style={{
            width: DOT_SIZE + 4,
            height: DOT_SIZE + 4,
            borderRadius: (DOT_SIZE + 4) / 2,
            backgroundColor: getScoreColor(s.clarityScore, colors),
            marginBottom: Spacing.sm,
          }} />
          <Text style={[Typography.h2, { color: getScoreColor(s.clarityScore, colors) }]}>
            {s.clarityScore}
          </Text>
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
            {STRINGS.PROGRESS.CHART_MIN_SESSIONS}
          </Text>
        </View>
      </View>
    );
  }

  // No sessions — shouldn't happen but guard
  if (sessions.length === 0) return null;

  // Chronological order (sessions come newest-first)
  const chronological = [...sessions].reverse();
  const plotWidth = chartWidth - Y_LABEL_WIDTH;

  return (
    <View style={[styles.chartCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
      <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
        {STRINGS.PROGRESS.IMPROVEMENT}
      </Text>

      <View
        style={{ flexDirection: 'row' }}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        {/* Y-axis labels */}
        <View style={{ width: Y_LABEL_WIDTH, height: CHART_HEIGHT, justifyContent: 'space-between' }}>
          {[...Y_LABELS].reverse().map((val) => (
            <Text key={val} style={[Typography.caption, { color: colors.textTertiary, fontSize: 10, textAlign: 'right' }]}>
              {val}
            </Text>
          ))}
        </View>

        {/* Chart area */}
        {plotWidth > 0 && (
          <View style={{ flex: 1, height: CHART_HEIGHT, marginLeft: Spacing.xs }}>
            {/* Grid lines at 0, 25, 50, 75, 100 */}
            {Y_LABELS.map((val) => {
              const bottomPx = (val / 100) * (CHART_HEIGHT - DOT_SIZE) + DOT_SIZE / 2;
              return (
                <View
                  key={`grid-${val}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: bottomPx,
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.border,
                  }}
                />
              );
            })}

            {/* Gradient fill bands (simulate gradient with layered Views) */}
            {(() => {
              const bands = 4;
              const bandHeight = CHART_HEIGHT / bands;
              return Array.from({ length: bands }).map((_, i) => (
                <View
                  key={`fill-${i}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: bandHeight * (bands - i),
                    backgroundColor: colors.primary,
                    opacity: 0.02 + i * 0.01,
                  }}
                />
              ));
            })()}

            {/* Connecting lines between dots */}
            {chronological.map((s, i) => {
              if (i >= chronological.length - 1) return null;
              const next = chronological[i + 1];

              const x1 = (i / (chronological.length - 1)) * (plotWidth - DOT_SIZE) + DOT_SIZE / 2;
              const y1 = (s.clarityScore / 100) * (CHART_HEIGHT - DOT_SIZE) + DOT_SIZE / 2;
              const x2 = ((i + 1) / (chronological.length - 1)) * (plotWidth - DOT_SIZE) + DOT_SIZE / 2;
              const y2 = (next.clarityScore / 100) * (CHART_HEIGHT - DOT_SIZE) + DOT_SIZE / 2;

              const dx = x2 - x1;
              const dy = y2 - y1;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(-dy, dx) * (180 / Math.PI);

              return (
                <View
                  key={`line-${i}`}
                  style={{
                    position: 'absolute',
                    left: x1,
                    bottom: y1 - 1,
                    width: length,
                    height: 2.5,
                    backgroundColor: colors.primary,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left center',
                    borderRadius: 1,
                  }}
                />
              );
            })}

            {/* Data dots */}
            {chronological.map((s, i) => {
              const x = (i / (chronological.length - 1)) * (plotWidth - DOT_SIZE);
              const y = (s.clarityScore / 100) * (CHART_HEIGHT - DOT_SIZE);

              return (
                <View
                  key={`dot-${i}`}
                  style={{
                    position: 'absolute',
                    left: x,
                    bottom: y,
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: DOT_SIZE / 2,
                    backgroundColor: getScoreColor(s.clarityScore, colors),
                    borderWidth: 2,
                    borderColor: colors.surfaceElevated,
                  }}
                />
              );
            })}

            {/* Score labels on dots (only first and last to avoid clutter) */}
            {chronological.length >= 2 && [0, chronological.length - 1].map((idx) => {
              const s = chronological[idx];
              const x = (idx / (chronological.length - 1)) * (plotWidth - DOT_SIZE);
              const y = (s.clarityScore / 100) * (CHART_HEIGHT - DOT_SIZE);
              const isTop = s.clarityScore > 50;

              return (
                <Text
                  key={`label-${idx}`}
                  style={{
                    position: 'absolute',
                    left: x - 4,
                    bottom: isTop ? y + DOT_SIZE + 2 : y - 16,
                    fontSize: 11,
                    fontWeight: '700',
                    color: getScoreColor(s.clarityScore, colors),
                  }}
                >
                  {s.clarityScore}
                </Text>
              );
            })}
          </View>
        )}
      </View>

      {/* X-axis date labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs, paddingLeft: Y_LABEL_WIDTH + Spacing.xs }}>
        {chronological.length <= 6
          ? chronological.map((s, i) => (
              <Text key={`date-${i}`} style={[Typography.caption, { color: colors.textTertiary, fontSize: 10 }]}>
                {formatChartDate(s.date)}
              </Text>
            ))
          : [0, Math.floor(chronological.length / 2), chronological.length - 1].map((idx) => (
              <Text key={`date-${idx}`} style={[Typography.caption, { color: colors.textTertiary, fontSize: 10 }]}>
                {formatChartDate(chronological[idx].date)}
              </Text>
            ))
        }
      </View>
    </View>
  );
}

// ── Session row ───────────────────────────────────

type SessionRowProps = {
  session: Session;
  colors: ColorTheme;
  onPress: () => void;
};

function SessionRow({ session, colors, onPress }: SessionRowProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.sessionRow,
        { backgroundColor: colors.surfaceElevated, opacity: pressed ? 0.7 : 1 },
        Shadows.card,
      ]}
    >
      <View style={styles.sessionLeft}>
        <View style={styles.sessionDateRow}>
          <View
            style={[
              styles.sessionDot,
              { backgroundColor: getScoreColor(session.clarityScore, colors) },
            ]}
          />
          <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>
            {formatSessionDate(session.date)}
          </Text>
        </View>
        <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {formatDuration(session.durationSeconds)} &middot; {session.wordsPerMinute} WPM &middot; {session.fillerCount} fillers
        </Text>
      </View>

      <View style={styles.sessionRight}>
        <Text
          style={[
            Typography.h3,
            { color: getScoreColor(session.clarityScore, colors) },
          ]}
        >
          {session.clarityScore}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions, loading } = useSessionHistory();

  // Staggered fade-in for stat cards
  const statAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const statTranslateY = [
    useRef(new Animated.Value(16)).current,
    useRef(new Animated.Value(16)).current,
    useRef(new Animated.Value(16)).current,
    useRef(new Animated.Value(16)).current,
  ];

  // Empty state fade-in
  const emptyFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sessions.length === 0 && !loading) {
      Animated.timing(emptyFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [sessions.length, loading]);

  useEffect(() => {
    if (sessions.length > 0) {
      const animations = statAnims.map((anim, i) =>
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay: i * 150,
            useNativeDriver: true,
          }),
          Animated.timing(statTranslateY[i], {
            toValue: 0,
            duration: 400,
            delay: i * 150,
            useNativeDriver: true,
          }),
        ]),
      );
      Animated.parallel(animations).start();
    }
  }, [sessions.length > 0]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="hourglass-outline" size={32} color={colors.textTertiary} />
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.emptyState, { opacity: emptyFadeAnim }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="bar-chart-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[Typography.h3, styles.emptyTitle, { color: colors.text }]}>
            {STRINGS.PROGRESS.EMPTY_TITLE}
          </Text>
          <Text style={[Typography.body, styles.emptyBody, { color: colors.textSecondary }]}>
            {STRINGS.PROGRESS.EMPTY_BODY}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Compute summary stats
  const totalSessions = sessions.length;
  const avgClarity = Math.round(
    sessions.reduce((sum, s) => sum + s.clarityScore, 0) / totalSessions,
  );
  const avgWpm = Math.round(
    sessions.reduce((sum, s) => sum + s.wordsPerMinute, 0) / totalSessions,
  );
  const totalTime = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const recentSessions = sessions.slice(0, 10);

  function navigateToSession(session: Session) {
    router.push({
      pathname: '/results',
      params: {
        transcript: session.transcript,
        durationSeconds: session.durationSeconds.toString(),
        clarityScore: session.clarityScore.toString(),
        wordsPerMinute: session.wordsPerMinute.toString(),
        fillerCount: session.fillerCount.toString(),
        fillerPercentage: session.fillerPercentage.toString(),
        totalWords: session.totalWords.toString(),
      },
    });
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary cards - 2x2 grid */}
      <View style={[styles.statsGrid, { marginTop: Spacing.md }]}>
        <Animated.View style={[styles.statAnimWrapper, { opacity: statAnims[0], transform: [{ translateY: statTranslateY[0] }] }]}>
          <StatCard
            label={STRINGS.PROGRESS.TOTAL_SESSIONS}
            value={totalSessions.toString()}
            colors={colors}
            accentColor={colors.primary}
          />
        </Animated.View>
        <Animated.View style={[styles.statAnimWrapper, { opacity: statAnims[1], transform: [{ translateY: statTranslateY[1] }] }]}>
          <StatCard
            label={STRINGS.PROGRESS.AVG_CLARITY}
            value={avgClarity.toString()}
            valueColor={getScoreColor(avgClarity, colors)}
            colors={colors}
            accentColor={getScoreColor(avgClarity, colors)}
            trend={avgClarity > 70 ? 'up' : avgClarity < 50 ? 'down' : 'none'}
          />
        </Animated.View>
        <Animated.View style={[styles.statAnimWrapper, { opacity: statAnims[2], transform: [{ translateY: statTranslateY[2] }] }]}>
          <StatCard
            label={STRINGS.PROGRESS.AVG_WPM}
            value={avgWpm.toString()}
            colors={colors}
            accentColor={colors.accent}
          />
        </Animated.View>
        <Animated.View style={[styles.statAnimWrapper, { opacity: statAnims[3], transform: [{ translateY: statTranslateY[3] }] }]}>
          <StatCard
            label={STRINGS.PROGRESS.TOTAL_TIME}
            value={formatPracticeTime(totalTime)}
            colors={colors}
            accentColor={colors.primary}
          />
        </Animated.View>
      </View>

      {/* Clarity chart */}
      <ClarityChart sessions={recentSessions} colors={colors} />

      {/* Motivational message */}
      {sessions.length >= 2 && (() => {
        const chronological = [...recentSessions].reverse();
        const latestClarity = chronological[chronological.length - 1]?.clarityScore ?? 0;
        const prevClarity = chronological[chronological.length - 2]?.clarityScore ?? 0;

        let message = 'Every session makes you better';
        let messageColor: string = colors.textSecondary;

        if (sessions.length >= 5 && avgClarity >= 80) {
          message = 'Exceptional clarity! You\'re in the top tier \u{1F3C6}';
          messageColor = colors.accent;
        } else if (latestClarity > prevClarity) {
          message = 'You\'re improving! Keep it up \u{1F3AF}';
          messageColor = colors.success;
        }

        return (
          <View style={[styles.motivationalCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[Typography.body, { color: messageColor, textAlign: 'center' }]}>
              {message}
            </Text>
          </View>
        );
      })()}

      {/* Recent sessions list */}
      <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
        {STRINGS.PROGRESS.RECENT_SESSIONS}
      </Text>

      {recentSessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          colors={colors}
          onPress={() => navigateToSession(session)}
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  chartCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  chartArea: {
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  chartDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    borderWidth: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sessionLeft: {
    flex: 1,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statAnimWrapper: {
    width: '48%',
    flexGrow: 1,
  },
  motivationalCard: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sessionDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});
