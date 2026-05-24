import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useColorScheme } from './useColorScheme';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

type Props = {
  visible: boolean;
  onAgree: () => void;
  onDecline: () => void;
};

export function AIConsentModal({ visible, onAgree, onDecline }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          </View>

          <Text style={[Typography.h2, { color: colors.text, textAlign: 'center', marginTop: Spacing.md }]}>
            {STRINGS.CONSENT.TITLE}
          </Text>

          <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginTop: Spacing.md }]}>
            {STRINGS.CONSENT.BODY}
          </Text>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAgree();
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
              {STRINGS.CONSENT.AGREE}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDecline();
            }}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[Typography.button, { color: colors.textSecondary }]}>
              {STRINGS.CONSENT.DECLINE}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  primaryButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  secondaryButton: {
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
});
