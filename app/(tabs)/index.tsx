import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
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

  // Recording pulse rings
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;

  // Analyzing spin
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Impromptu card scale
  const cardScale = useRef(new Animated.Value(1)).current;

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

      // Pulse rings
      const ringAnims = [ring1Anim, ring2Anim, ring3Anim];
      const loops = ringAnims.map((ring, i) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.delay(i * 400),
            Animated.parallel([
              Animated.timing(ring, {
                toValue: 1,
                duration: 1800,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(ring, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        );
        loop.start();
        return loop;
      });

      return () => {
        anim.stop();
        loops.forEach((l) => l.stop());
        ring1Anim.setValue(0);
        ring2Anim.setValue(0);
        ring3Anim.setValue(0);
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim, ring1Anim, ring2Anim, ring3Anim]);

  useEffect(() => {
    if (isAnalyzing) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      );
      spin.start();
      return () => {
        spin.stop();
        spinAnim.setValue(0);
      };
    }
  }, [isAnalyzing, spinAnim]);

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

  const spinRotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isAnalyzing) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ rotate: spinRotate }] }}>
          <Ionicons name="sparkles" size={48} color={colors.primary} />
        </Animated.View>
        <Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.lg }]}>
          {STRINGS.PRACTICE.ANALYZING}
        </Text>
      </View>
    );
  }

  function renderPulseRings() {
    const rings = [
      { anim: ring1Anim, size: 120, opacity: 0.3 },
      { anim: ring2Anim, size: 150, opacity: 0.2 },
      { anim: ring3Anim, size: 180, opacity: 0.1 },
    ];

    return rings.map((ring, i) => {
      const scale = ring.anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
      });
      const animOpacity = ring.anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      });

      return (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: ring.size,
            height: ring.size,
            borderRadius: ring.size / 2,
            borderWidth: 2,
            borderColor: colors.error,
            opacity: animOpacity,
            transform: [{ scale }],
          }}
        />
      );
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[Typography.h1, styles.appName, { color: colors.text }]}>
        {STRINGS.APP_NAME}
      </Text>

      {!isRecording && (
        <Pressable
          onPressIn={() => {
            Animated.timing(cardScale, {
              toValue: 0.97,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.timing(cardScale, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }).start();
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/impromptu');
          }}
        >
          <Animated.View
            style={[
              styles.impromptuCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.accent,
                transform: [{ scale: cardScale }],
              },
              Shadows.card,
            ]}
          >
            <View style={styles.impromptuContent}>
              <Ionicons name="flash-outline" size={24} color={colors.accent} />
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
          </Animated.View>
        </Pressable>
      )}

      <View style={styles.recordArea}>
        {isRecording && (
          <Text
            style={{
              color: colors.text,
              marginBottom: Spacing.xl,
              fontSize: 36,
              fontWeight: '700',
            }}
          >
            {formatTime(elapsed)}
          </Text>
        )}

        <View style={styles.recordButtonWrapper}>
          {/* Radial glow rings (always visible behind button) */}
          <View
            style={[
              styles.glowRingOuter,
              { backgroundColor: colors.primary, opacity: 0.04 },
            ]}
          />
          <View
            style={[
              styles.glowRingInner,
              { backgroundColor: colors.primary, opacity: 0.08 },
            ]}
          />

          {/* Recording pulse rings */}
          {isRecording && renderPulseRings()}

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={handleRecordPress}
              style={({ pressed }) => [
                styles.recordButton,
                {
                  backgroundColor: isRecording ? colors.error : 'transparent',
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              {isRecording ? (
                <Ionicons name="stop" size={36} color="#FFFFFF" />
              ) : (
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={styles.recordButtonIcon}
                  contentFit="cover"
                />
              )}
            </Pressable>
          </Animated.View>
        </View>

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
  recordButtonWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRingOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  glowRingInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  recordButtonIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  tapText: {
    marginTop: Spacing.lg,
  },
});
