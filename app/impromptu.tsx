import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { AIConsentModal } from '@/components/AIConsentModal';
import { PaywallGate } from '@/components/PaywallGate';
import { HeaderLogo } from '@/components/HeaderLogo';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { getRandomTopic, Topic } from '@/src/constants/topics';
import { transcribeAudio } from '@/src/services/transcription';
import { analyzeSpeech } from '@/src/services/speechAnalysis';
import { useSessionHistory } from '@/src/hooks/useSessionHistory';
import { useAIConsent } from '@/src/hooks/useAIConsent';
import { useSubscription } from '@/src/hooks/useSubscription';

const THINK_TIME = 10;
const MIN_DURATION = 5;
const MAX_DURATION = 180;

type Phase = 'topic' | 'thinking' | 'recording' | 'analyzing';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ImpromptuScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { saveSession } = useSessionHistory();
  const { requireConsent, showModal, grantConsent, setShowModal } = useAIConsent();
  const { isSubscribed, isLoading: subLoading } = useSubscription();

  const [topic, setTopic] = useState<Topic>(() => getRandomTopic());
  const [phase, setPhase] = useState<Phase>('topic');
  const [countdown, setCountdown] = useState(THINK_TIME);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation during recording
  useEffect(() => {
    if (phase === 'recording') {
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
  }, [phase, pulseAnim]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Think countdown → auto-start recording
  useEffect(() => {
    if (phase !== 'thinking') return;

    setCountdown(THINK_TIME);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [phase]);

  function handleNewTopic() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTopic(getRandomTopic(topic.id));
    setError(null);
  }

  function handleStart() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!requireConsent()) return;
    setPhase('thinking');
  }

  async function startRecording() {
    setError(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission required');
        setPhase('topic');
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('recording');
      setElapsed(0);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError(STRINGS.ERRORS.RECORDING_FAILED);
      setPhase('topic');
    }
  }

  async function stopRecording() {
    if (!recorder.isRecording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const durationSeconds = Math.round(recorder.currentTime);

    if (durationSeconds < MIN_DURATION) {
      await recorder.stop();
      setError(STRINGS.IMPROMPTU.MIN_DURATION);
      setPhase('topic');
      return;
    }

    setPhase('analyzing');

    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError(STRINGS.ERRORS.RECORDING_FAILED);
        setPhase('topic');
        return;
      }

      const result = await transcribeAudio(uri);
      if (!result.ok) {
        setError(result.error);
        setPhase('topic');
        return;
      }

      const transcriptText = result.text;
      const metrics = analyzeSpeech(transcriptText, durationSeconds);

      if (metrics.tooShort) {
        setError(STRINGS.ERRORS.RECORDING_TOO_SHORT);
        setPhase('topic');
        return;
      }

      await saveSession({
        durationSeconds,
        clarityScore: metrics.clarityScore,
        wordsPerMinute: metrics.wordsPerMinute,
        fillerCount: metrics.fillerCount,
        fillerPercentage: metrics.fillerPercentage,
        totalWords: metrics.totalWords,
        transcript: transcriptText,
        impromptu: true,
        topic: topic.prompt,
      });

      router.replace({
        pathname: '/results',
        params: {
          transcript: transcriptText,
          durationSeconds: durationSeconds.toString(),
          clarityScore: metrics.clarityScore.toString(),
          wordsPerMinute: metrics.wordsPerMinute.toString(),
          fillerCount: metrics.fillerCount.toString(),
          fillerPercentage: metrics.fillerPercentage.toString(),
          totalWords: metrics.totalWords.toString(),
        },
      });
    } catch {
      setError(STRINGS.ERRORS.TRANSCRIPTION_FAILED);
      setPhase('topic');
    }
  }

  // ── Paywall Gate ──
  if (!subLoading && !isSubscribed) {
    return <PaywallGate />;
  }

  // ── Analyzing ──
  if (phase === 'analyzing') {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="sparkles" size={48} color={colors.primary} />
        <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.lg }]}>
          {STRINGS.IMPROMPTU.ANALYZING}
        </Text>
      </View>
    );
  }

  // ── Thinking countdown ──
  if (phase === 'thinking') {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[Typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }]}>
          {STRINGS.IMPROMPTU.THINK_TIME}
        </Text>
        <Text style={[styles.countdownText, { color: colors.accent }]}>
          {countdown}
        </Text>
        <View style={[styles.topicCardCompact, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
          <Text style={[Typography.body, { color: colors.text, textAlign: 'center', lineHeight: 24 }]}>
            {topic.prompt}
          </Text>
        </View>
        <Text style={[Typography.caption, { color: colors.textTertiary, marginTop: Spacing.lg }]}>
          {STRINGS.IMPROMPTU.RECORDING_STARTS}
        </Text>
      </View>
    );
  }

  // ── Recording ──
  if (phase === 'recording') {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.topicCardCompact, { backgroundColor: colors.surfaceElevated, marginBottom: Spacing.xl }, Shadows.card]}>
          <Text style={[Typography.body, { color: colors.text, textAlign: 'center', lineHeight: 24 }]}>
            {topic.prompt}
          </Text>
        </View>

        <Text style={[Typography.h1, { color: colors.text, marginBottom: Spacing.lg }]}>
          {formatTime(elapsed)}
        </Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={stopRecording}
            style={({ pressed }) => [
              styles.recordButton,
              {
                backgroundColor: colors.error,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons name="stop" size={32} color="#FFFFFF" />
          </Pressable>
        </Animated.View>

        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
          {STRINGS.IMPROMPTU.TAP_TO_STOP}
        </Text>
      </View>
    );
  }

  // ── Topic selection (default) ──
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

        <Text style={[Typography.h1, { color: colors.text }]}>
          {STRINGS.IMPROMPTU.TITLE}
        </Text>
      </View>

      <View style={styles.topicArea}>
        <Text style={[Typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm }]}>
          {STRINGS.IMPROMPTU.YOUR_TOPIC}
        </Text>

        <View style={[styles.topicCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.accent }, Shadows.elevated]}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '20' }]}>
            <Text style={[Typography.caption, { color: colors.accent, fontWeight: '600' }]}>
              {topic.category}
            </Text>
          </View>
          <Text style={[Typography.h3, { color: colors.text, textAlign: 'center', lineHeight: 28, marginTop: Spacing.md }]}>
            {topic.prompt}
          </Text>
        </View>

        <Pressable
          onPress={handleNewTopic}
          style={({ pressed }) => [
            styles.newTopicButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="shuffle-outline" size={20} color={colors.primary} />
          <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.xs }]}>
            {STRINGS.IMPROMPTU.NEW_TOPIC}
          </Text>
        </Pressable>

        {error && (
          <Text style={[Typography.caption, { color: colors.error, textAlign: 'center', marginTop: Spacing.sm }]}>
            {error}
          </Text>
        )}
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startButton,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Ionicons name="mic" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
          <Text style={[Typography.button, { color: '#FFFFFF', textTransform: 'uppercase' }]}>
            Start
          </Text>
        </Pressable>

        <Text style={[Typography.caption, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm }]}>
          {THINK_TIME}s to think, then recording starts
        </Text>
      </View>

      <AIConsentModal
        visible={showModal}
        onAgree={grantConsent}
        onDecline={() => {
          setShowModal(false);
          setError(STRINGS.CONSENT.REQUIRED);
        }}
      />
    </View>
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
  topicArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  topicCardCompact: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    maxWidth: 320,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  newTopicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  bottomSection: {
    paddingBottom: Spacing.xl,
  },
  startButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
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
  countdownText: {
    fontSize: 72,
    fontWeight: '700',
    marginVertical: Spacing.lg,
  },
});
