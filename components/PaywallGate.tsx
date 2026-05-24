import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

export function PaywallGate() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="lock-closed" size={32} color={colors.primary} />
        </View>
        <Text style={[Typography.h2, { color: colors.text, textAlign: 'center', marginTop: Spacing.lg }]}>
          {STRINGS.PAYWALL.GATE_TITLE}
        </Text>
        <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
          {STRINGS.PAYWALL.GATE_BODY}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/paywall');
          }}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              ...Shadows.elevated,
            },
          ]}
        >
          <Text style={[Typography.button, { color: '#FFFFFF', fontSize: 16 }]}>
            {STRINGS.PAYWALL.GATE_CTA}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButton: {
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: Spacing.lg,
  },
});
