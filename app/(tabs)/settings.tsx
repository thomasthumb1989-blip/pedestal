import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { APP_VERSION } from '@/src/constants/config';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  trailing?: string;
  colors: ColorTheme;
};

function SettingsRow({ icon, label, onPress, trailing, colors }: SettingsRowProps) {
  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
          {label}
        </Text>
      </View>
      {trailing ? (
        <Text style={[Typography.caption, { color: colors.textTertiary }]}>
          {trailing}
        </Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <Text style={[Typography.caption, styles.sectionTitle, { color: colors.textSecondary }]}>
          {STRINGS.SETTINGS.ACCOUNT}
        </Text>
        <SettingsRow
          icon="person-outline"
          label={STRINGS.SETTINGS.ACCOUNT}
          onPress={() => {}}
          colors={colors}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <Text style={[Typography.caption, styles.sectionTitle, { color: colors.textSecondary }]}>
          {STRINGS.SETTINGS.SUBSCRIPTION}
        </Text>
        <SettingsRow
          icon="card-outline"
          label={STRINGS.SETTINGS.SUBSCRIPTION}
          onPress={() => {}}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="refresh-outline"
          label={STRINGS.SETTINGS.RESTORE_PURCHASES}
          onPress={() => {}}
          colors={colors}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <Text style={[Typography.caption, styles.sectionTitle, { color: colors.textSecondary }]}>
          {STRINGS.SETTINGS.NOTIFICATIONS}
        </Text>
        <SettingsRow
          icon="notifications-outline"
          label={STRINGS.SETTINGS.NOTIFICATIONS}
          onPress={() => {}}
          colors={colors}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <SettingsRow
          icon="shield-outline"
          label={STRINGS.SETTINGS.PRIVACY_POLICY}
          onPress={() => {}}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="document-text-outline"
          label={STRINGS.SETTINGS.TERMS}
          onPress={() => {}}
          colors={colors}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <SettingsRow
          icon="information-circle-outline"
          label={STRINGS.SETTINGS.APP_VERSION}
          trailing={APP_VERSION}
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: Spacing.xs,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.xs,
  },
});
