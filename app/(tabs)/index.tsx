import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/components/useColorScheme';
import { AIConsentModal } from '@/components/AIConsentModal';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { transcribeAudio } from '@/src/services/transcription';
import { analyzeSpeech } from '@/src/services/speechAnalysis';
import { useSessionHistory } from '@/src/hooks/useSessionHistory';
import { useAIConsent } from '@/src/hooks/useAIConsent';

const MIN_DURATION = 10;
const MAX_DURATION = 300;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PracticeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { saveSession } = useSessionHistory();
  const { requireConsent, showModal, grantConsent, setShowModal } = useAIConsent();

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
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

  async function startRecording() {
    setError(null);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
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
    if (!recordingRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const recording = recordingRef.current;
    recordingRef.current = null;
    setIsRecording(false);

    const status = await recording.getStatusAsync();
    const durationMs = status.durationMillis ?? 0;
    const durationSeconds = Math.round(durationMs / 1000);

    if (durationSeconds < MIN_DURATION) {
      await recording.stopAndUnloadAsync();
      setError(STRINGS.PRACTICE.MIN_DURATION);
      return;
    }

    setIsAnalyzing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        setError(STRINGS.ERRORS.RECORDING_FAILED);
        setIsAnalyzing(false);
        return;
      }

      const result = await transcribeAudio(uri);
      if (!result.ok) {
        setError(result.error);
        setIsAnalyzing(false);
        return;
      }

      const transcriptText = result.text;
      const metrics = analyzeSpeech(transcriptText, durationSeconds);

      await saveSession({
        durationSeconds,
        clarityScore: metrics.clarityScore,
        wordsPerMinute: metrics.wordsPerMinute,
        fillerCount: metrics.fillerCount,
        fillerPercentage: metrics.fillerPercentage,
        totalWords: metrics.totalWords,
        transcript: transcriptText,
      });

      router.push({
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

  if (isAnalyzing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="sparkles" size={48} color={colors.primary} />
        <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.lg }]}>
          {STRINGS.PRACTICE.ANALYZING}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.h1, styles.appName, { color: colors.text }]}>
        {STRINGS.APP_NAME}
      </Text>

      {!isRecording && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/impromptu');
          }}
          style={({ pressed }) => [
            styles.impromptuCard,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.accent,
              opacity: pressed ? 0.7 : 1,
            },
            Shadows.card,
          ]}
        >
          <View style={styles.impromptuContent}>
            <Ionicons name="shuffle-outline" size={24} color={colors.accent} />
            <View style={styles.impromptuText}>
              <Text style={[Typography.h3, { color: colors.text }]}>
                {STRINGS.PRACTICE.IMPROMPTU_TITLE}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                {STRINGS.PRACTICE.IMPROMPTU_BODY}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </View>
        </Pressable>
      )}

      <View style={styles.recordArea}>
        {isRecording && (
          <Text style={[Typography.h1, { color: colors.text, marginBottom: Spacing.xl }]}>
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

        <Text style={[Typography.body, styles.tapText, { color: colors.textSecondary }]}>
          {isRecording ? STRINGS.PRACTICE.TAP_TO_STOP : STRINGS.PRACTICE.TAP_TO_START}
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
  appName: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  recordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impromptuCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  impromptuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impromptuText: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapText: {
    marginTop: Spacing.lg,
  },
});
