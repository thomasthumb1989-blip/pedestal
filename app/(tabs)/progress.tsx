import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
};

function StatCard({ label, value, valueColor, colors }: StatProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
      <Text style={[Typography.h2, { color: valueColor ?? colors.text }]}>{value}</Text>
      <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Mini clarity chart (pure RN views) ────────────

function ClarityChart({ sessions, colors }: { sessions: Session[]; colors: ColorTheme }) {
  if (sessions.length < 2) {
    return (
      <View style={[styles.chartCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.sm }]}>
          {STRINGS.PROGRESS.IMPROVEMENT}
        </Text>
        <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.lg }]}>
          {STRINGS.PROGRESS.CHART_MIN_SESSIONS}
        </Text>
      </View>
    );
  }

  const chronological = [...sessions].reverse();
  const scores = chronological.map((s) => s.clarityScore);
  const maxScore = Math.max(...scores, 100);
  const minScore = Math.min(...scores, 0);
  const range = Math.max(maxScore - minScore, 20);
  const chartHeight = 120;

  return (
    <View style={[styles.chartCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
      <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
        {STRINGS.PROGRESS.IMPROVEMENT}
      </Text>

      <View style={[styles.chartArea, { height: chartHeight }]}>
        {/* Grid lines */}
        {[0, 0.5, 1].map((pct) => (
          <View
            key={pct}
            style={[
              styles.gridLine,
              {
                backgroundColor: colors.border,
                bottom: pct * chartHeight,
              },
            ]}
          />
        ))}

        {/* Data points + connecting lines */}
        {scores.map((score, i) => {
          const x = scores.length === 1 ? 0.5 : i / (scores.length - 1);
          const y = (score - minScore) / range;
          const dotLeftPct = x * 100;
          const dotBottom = y * (chartHeight - 12);

          return (
            <View key={i}>
              {/* Line to next point */}
              {i < scores.length - 1 && (() => {
                const nextY = (scores[i + 1] - minScore) / range;
                const nextX = (i + 1) / (scores.length - 1);
                const x1 = x * 100;
                const x2 = nextX * 100;
                const y1 = y * (chartHeight - 12) + 6;
                const y2 = nextY * (chartHeight - 12) + 6;
                const dx = (x2 - x1);
                const dy = (y2 - y1);
                const lineLen = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(-dy, dx) * (180 / Math.PI);

                return (
                  <View
                    style={{
                      position: 'absolute' as const,
                      left: `${x1}%` as any,
                      bottom: y1,
                      width: `${lineLen}%` as any,
                      height: 2,
                      backgroundColor: colors.primary,
                      transformOrigin: 'left center',
                      transform: [{ rotate: `${angle}deg` }],
                    }}
                  />
                );
              })()}

              {/* Dot */}
              <View
                style={[
                  styles.chartDot,
                  {
                    left: `${dotLeftPct}%` as any,
                    bottom: dotBottom,
                    backgroundColor: getScoreColor(score, colors),
                    borderColor: colors.surfaceElevated,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Score labels below chart */}
      <View style={styles.chartLabels}>
        <Text style={[Typography.caption, { color: colors.textTertiary }]}>
          {scores[0]}
        </Text>
        <Text style={[Typography.caption, { color: colors.textTertiary }]}>
          {scores[scores.length - 1]}
        </Text>
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
        <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>
          {formatSessionDate(session.date)}
        </Text>
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
      <Text style={[Typography.h1, styles.title, { color: colors.text }]}>
        {STRINGS.PROGRESS.TITLE}
      </Text>

      {/* Summary cards - 2x2 grid */}
      <View style={styles.statsGrid}>
        <StatCard
          label={STRINGS.PROGRESS.TOTAL_SESSIONS}
          value={totalSessions.toString()}
          colors={colors}
        />
        <StatCard
          label={STRINGS.PROGRESS.AVG_CLARITY}
          value={avgClarity.toString()}
          valueColor={getScoreColor(avgClarity, colors)}
          colors={colors}
        />
        <StatCard
          label={STRINGS.PROGRESS.AVG_WPM}
          value={avgWpm.toString()}
          colors={colors}
        />
        <StatCard
          label={STRINGS.PROGRESS.TOTAL_TIME}
          value={formatPracticeTime(totalTime)}
          colors={colors}
        />
      </View>

      {/* Clarity chart */}
      <ClarityChart sessions={recentSessions} colors={colors} />

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
    width: '48%',
    flexGrow: 1,
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
});
