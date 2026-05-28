import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { AIConsentModal } from '@/components/AIConsentModal';
import { PaywallGate } from '@/components/PaywallGate';
import { HeaderLogo } from '@/components/HeaderLogo';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { getDrillById, Drill } from '@/src/constants/drills';
import { transcribeAudio } from '@/src/services/transcription';
import { analyzeSpeech, SpeechMetrics } from '@/src/services/speechAnalysis';
import { useAIConsent } from '@/src/hooks/useAIConsent';
import { useSubscription } from '@/src/hooks/useSubscription';
import { useFreeSessionLimit } from '@/src/hooks/useFreeSessionLimit';
import { useSessionHistory } from '@/src/hooks/useSessionHistory';

const MIN_DURATION = 5;
const MAX_DURATION = 120;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getMetricLabel(metric: string): string {
  if (metric === 'fillerPercentage') return 'Clarity';
  if (metric === 'wordsPerMinute') return 'WPM';
  return 'Clarity';
}

function getMetricValue(metrics: SpeechMetrics, metric: string): number {
  if (metric === 'fillerPercentage') return metrics.fillerPercentage;
  if (metric === 'wordsPerMinute') return metrics.wordsPerMinute;
  return metrics.clarityScore;
}

function formatTarget(drill: Drill): string {
  const label = getMetricLabel(drill.targetMetric);
  if (drill.targetMetric === 'fillerPercentage') {
    // Flip: "filler < 3%" becomes "Clarity > 97%"
    return `${label} > ${100 - drill.targetValue}%`;
  }
  if (drill.targetDirection === 'below') return `${label} < ${drill.targetValue}%`;
  if (drill.targetDirection === 'above') return `${label} > ${drill.targetValue}`;
  return `${label}: ${drill.targetValue}-${drill.targetMax}`;
}

function checkPassed(drill: Drill, value: number): boolean {
  if (drill.targetDirection === 'below') return value < drill.targetValue;
  if (drill.targetDirection === 'above') return value > drill.targetValue;
  return value >= drill.targetValue && value <= (drill.targetMax ?? drill.targetValue);
}

function formatMetricDisplay(drill: Drill, value: number): string {
  if (drill.targetMetric === 'fillerPercentage') return `${100 - value}%`;
  return value.toString();
}

function resultColor(passed: boolean, colors: ColorTheme): string {
  return passed ? colors.success : colors.error;
}

export default function DrillScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { drillId } = useLocalSearchParams<{ drillId: string }>();

  const drill = getDrillById(drillId ?? '');
  const { requireConsent, showModal, grantConsent, setShowModal } = useAIConsent();
  const { isSubscribed, isLoading: subLoading } = useSubscription();
  const { hasReachedLimit, incrementSessionCount, isLoading: limitLoading } = useFreeSessionLimit();
  const { saveSession } = useSessionHistory();

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ metrics: SpeechMetrics; passed: boolean } | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!subLoading && !limitLoading && !isSubscribed && hasReachedLimit) {
    return <PaywallGate />;
  }

  if (!drill) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[Typography.body, { color: colors.textSecondary }]}>Drill not found</Text>
      </View>
    );
  }

  async function startRecording() {
    setError(null);
    setResult(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission required');
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      setError(STRINGS.ERRORS.RECORDING_FAILED);
    }
  }

  async function stopRecording() {
    if (!recorder.isRecording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsRecording(false);

    const durationSeconds = Math.round(recorder.currentTime);

    if (durationSeconds < MIN_DURATION) {
      await recorder.stop();
      setError(STRINGS.DRILL.MIN_DURATION);
      return;
    }

    setIsAnalyzing(true);

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError(STRINGS.ERRORS.RECORDING_FAILED);
        setIsAnalyzing(false);
        return;
      }

      const transcriptionResult = await transcribeAudio(uri);
      if (!transcriptionResult.ok) {
        setError(transcriptionResult.error);
        setIsAnalyzing(false);
        return;
      }

      const metrics = analyzeSpeech(transcriptionResult.text, durationSeconds);

      if (metrics.tooShort) {
        setError(STRINGS.ERRORS.RECORDING_TOO_SHORT);
        setIsAnalyzing(false);
        return;
      }

      const value = getMetricValue(metrics, drill!.targetMetric);
      const passed = checkPassed(drill!, value);

      await saveSession({
        durationSeconds,
        clarityScore: metrics.clarityScore,
        wordsPerMinute: metrics.wordsPerMinute,
        fillerCount: metrics.fillerCount,
        fillerPercentage: metrics.fillerPercentage,
        totalWords: metrics.totalWords,
        transcript: transcriptionResult.text,
        drill: true,
        drillName: drill!.title,
      });

      if (!isSubscribed) {
        await incrementSessionCount();
      }

      setResult({ metrics, passed });
    } catch {
      setError(STRINGS.ERRORS.TRANSCRIPTION_FAILED);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleRecordPress() {
    if (isAnalyzing) return;
    if (isRecording) {
      stopRecording();
    } else {
      if (!requireConsent()) return;
      startRecording();
    }
  }

  // ── Analyzing state ──
  if (isAnalyzing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="sparkles" size={48} color={colors.primary} />
        <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.lg }]}>
          {STRINGS.DRILL.ANALYZING}
        </Text>
      </View>
    );
  }

  // ── Result state ──
  if (result) {
    const value = getMetricValue(result.metrics, drill.targetMetric);
    const passed = result.passed;

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl, paddingTop: insets.top + Spacing.lg }}
      >
        <Text style={[Typography.h1, { color: colors.text, textAlign: 'center' }]}>
          {STRINGS.DRILL.RESULT_TITLE}
        </Text>

        <View style={[styles.resultCard, { backgroundColor: colors.surfaceElevated }, Shadows.elevated]}>
          <Ionicons
            name={passed ? 'checkmark-circle' : 'arrow-redo-circle'}
            size={56}
            color={resultColor(passed, colors)}
          />
          <Text style={[Typography.h2, { color: resultColor(passed, colors), marginTop: Spacing.sm }]}>
            {passed ? STRINGS.DRILL.PASSED : STRINGS.DRILL.NEEDS_WORK}
          </Text>

          <View style={styles.resultMetrics}>
            <View style={styles.resultMetricRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                {getMetricLabel(drill.targetMetric)} Score
              </Text>
              <Text style={[Typography.h3, { color: resultColor(passed, colors) }]}>
                {formatMetricDisplay(drill, value)}
              </Text>
            </View>
            <View style={[styles.resultDivider, { backgroundColor: colors.border }]} />
            <View style={styles.resultMetricRow}>
              <Text style={[Typography.body, { color: colors.textSecondary }]}>
                {STRINGS.DRILL.TARGET}
              </Text>
              <Text style={[Typography.h3, { color: colors.text }]}>
                {formatTarget(drill)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setResult(null);
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={[Typography.button, { color: '#FFFFFF', textTransform: 'uppercase' }]}>
              {STRINGS.DRILL.TRY_AGAIN}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={[Typography.button, { color: colors.primary }]}>
              {STRINGS.DRILL.BACK_TO_DRILLS}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Default: drill prompt + record ──
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
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

        <Text style={[Typography.h1, { color: colors.text }]}>{drill.title}</Text>

        {/* Technique tip */}
        <View style={[styles.tipCard, { backgroundColor: colors.primaryLight }, Shadows.card]}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.accent} />
            <Text style={[Typography.h3, { color: colors.text, marginLeft: Spacing.sm }]}>
              {STRINGS.DRILL.TIP_LABEL}
            </Text>
          </View>
          <Text style={[Typography.body, { color: colors.text, lineHeight: 24, marginTop: Spacing.sm }]}>
            {drill.tip}
          </Text>
        </View>

        {/* Prompt to read */}
        <View style={[styles.promptCard, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
          <Text style={[Typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm }]}>
            {STRINGS.DRILL.PROMPT_LABEL}
          </Text>
          <Text style={[Typography.body, { color: colors.text, lineHeight: 26, fontSize: 18 }]}>
            {drill.prompt}
          </Text>
        </View>

        {/* Target info */}
        <View style={styles.targetRow}>
          <Ionicons name="flag-outline" size={16} color={colors.textTertiary} />
          <Text style={[Typography.caption, { color: colors.textTertiary, marginLeft: Spacing.xs }]}>
            {STRINGS.DRILL.TARGET}: {formatTarget(drill)}
          </Text>
        </View>
      </View>

      {/* Record section */}
      <View style={styles.recordSection}>
        {isRecording && (
          <Text style={[Typography.h1, { color: colors.text, marginBottom: Spacing.lg }]}>
            {formatTime(elapsed)}
          </Text>
        )}

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={handleRecordPress}
            style={({ pressed }) => [
              styles.recordButton,
              {
                backgroundColor: isRecording ? colors.error : colors.primary,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={32}
              color="#FFFFFF"
            />
          </Pressable>
        </Animated.View>

        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
          {isRecording ? STRINGS.PRACTICE.TAP_TO_STOP : STRINGS.DRILL.RECORD_CTA}
        </Text>

        {error && (
          <Text style={[Typography.caption, { color: colors.error, marginTop: Spacing.md, textAlign: 'center' }]}>
            {error}
          </Text>
        )}
      </View>

      <AIConsentModal
        visible={showModal}
        onAgree={grantConsent}
        onDecline={() => {
          setShowModal(false);
          setError(STRINGS.CONSENT.REQUIRED);
        }}
      />
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
  tipCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    justifyContent: 'center',
  },
  recordSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  resultMetrics: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  resultMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resultDivider: {
    height: StyleSheet.hairlineWidth,
  },
  buttons: {
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
