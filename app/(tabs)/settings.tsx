import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';
import { APP_VERSION, BUNDLE_ID } from '@/src/constants/config';

const NOTIFICATIONS_KEY = '@pedestal_notifications';

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  trailingText?: string;
  destructive?: boolean;
  colors: ColorTheme;
};

function SettingsRow({ icon, label, onPress, trailing, trailingText, destructive, colors }: SettingsRowProps) {
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
        <View style={[styles.iconBg, { backgroundColor: `${destructive ? colors.error : colors.primary}15` }]}>
          <Ionicons name={icon} size={20} color={destructive ? colors.error : colors.primary} />
        </View>
        <Text style={[Typography.body, { color: destructive ? colors.error : colors.text, marginLeft: Spacing.md }]}>
          {label}
        </Text>
      </View>
      {trailing ? (
        trailing
      ) : trailingText ? (
        <Text style={[Typography.caption, { color: colors.textTertiary }]}>
          {trailingText}
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
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATIONS_KEY).then((value) => {
      setNotificationsEnabled(value === 'true');
    });
  }, []);

  const toggleNotifications = useCallback(async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, value ? 'true' : 'false');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  function handleManageSubscription() {
    const url = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: `https://play.google.com/store/account/subscriptions?package=${BUNDLE_ID}`,
      default: 'https://apps.apple.com/account/subscriptions',
    });
    Linking.openURL(url);
  }

  async function handleRestorePurchases() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestoreMessage(null);

    try {
      // TODO: Replace with RevenueCat restorePurchases
      // const customerInfo = await Purchases.restorePurchases();
      // if (customerInfo.entitlements.active['pro']) {
      //   setRestoreMessage(STRINGS.SETTINGS.RESTORE_SUCCESS);
      //   return;
      // }

      // Placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRestoreMessage(STRINGS.SETTINGS.RESTORE_NONE);
    } catch {
      setRestoreMessage(STRINGS.SETTINGS.RESTORE_ERROR);
    }
  }

  function handlePrivacyPolicy() {
    Linking.openURL('https://thomasthumb1989-blip.github.io/pedestal/privacy.html');
  }

  function handleTerms() {
    Linking.openURL('https://thomasthumb1989-blip.github.io/pedestal/terms.html');
  }

  function handleRateApp() {
    const url = Platform.select({
      ios: `https://apps.apple.com/app/id0000000000?action=write-review`, // Replace with real App Store ID
      android: `market://details?id=${BUNDLE_ID}`,
      default: `https://play.google.com/store/apps/details?id=${BUNDLE_ID}`,
    });
    Linking.openURL(url);
  }

  function handleResetOnboarding() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Reset Onboarding?',
      'This will clear onboarding progress and show the first-launch flow again.',
      [
        { text: STRINGS.SETTINGS.CANCEL, style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@pedestal_onboarding_complete');
            router.replace('/onboarding');
          },
        },
      ],
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      STRINGS.SETTINGS.DELETE_CONFIRM_TITLE,
      STRINGS.SETTINGS.DELETE_CONFIRM_BODY,
      [
        { text: STRINGS.SETTINGS.CANCEL, style: 'cancel' },
        {
          text: STRINGS.SETTINGS.DELETE_CONFIRM,
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await AsyncStorage.clear();
            router.replace('/onboarding');
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      {/* Subscription */}
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="diamond-outline" size={14} color={colors.textSecondary} />
          <Text style={[Typography.caption, styles.sectionTitle, { color: colors.textSecondary }]}>
            {STRINGS.SETTINGS.SUBSCRIPTION}
          </Text>
        </View>
        <SettingsRow
          icon="card-outline"
          label={STRINGS.SETTINGS.MANAGE_SUBSCRIPTION}
          onPress={handleManageSubscription}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="refresh-outline"
          label={STRINGS.SETTINGS.RESTORE_PURCHASES}
          onPress={handleRestorePurchases}
          colors={colors}
        />
        {restoreMessage && (
          <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: Spacing.xs, marginLeft: Spacing.xl + Spacing.md }]}>
            {restoreMessage}
          </Text>
        )}
      </View>

      {/* General */}
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="settings-outline" size={14} color={colors.textSecondary} />
          <Text style={[Typography.caption, styles.sectionTitle, { color: colors.textSecondary }]}>
            {STRINGS.SETTINGS.GENERAL}
          </Text>
        </View>
        <SettingsRow
          icon="notifications-outline"
          label={STRINGS.SETTINGS.NOTIFICATIONS}
          colors={colors}
          trailing={
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          }
        />
      </View>

      {/* Support */}
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }, Shadows.card]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
          <Text style={[Typography.caption, styles.sectionTitle, { color: colors.textSecondary }]}>
            {STRINGS.SETTINGS.SUPPORT}
          </Text>
        </View>
        <SettingsRow
          icon="star-outline"
          label={STRINGS.SETTINGS.RATE_APP}
          onPress={handleRateApp}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="shield-outline"
          label={STRINGS.SETTINGS.PRIVACY_POLICY}
          onPress={handlePrivacyPolicy}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="document-text-outline"
          label={STRINGS.SETTINGS.TERMS}
          onPress={handleTerms}
          colors={colors}
        />
      </View>

      {/* Danger Zone */}
      <View style={[styles.card, { backgroundColor: colors.error + '08', borderWidth: 1, borderColor: colors.error + '20' }, Shadows.card]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="warning-outline" size={14} color={colors.error} />
          <Text style={[Typography.caption, styles.sectionTitle, { color: colors.error }]}>
            {STRINGS.SETTINGS.DANGER}
          </Text>
        </View>
        <SettingsRow
          icon="refresh-outline"
          label={STRINGS.SETTINGS.RESET_ONBOARDING}
          onPress={handleResetOnboarding}
          destructive
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.error + '20' }]} />
        <SettingsRow
          icon="trash-outline"
          label={STRINGS.SETTINGS.DELETE_ACCOUNT}
          onPress={handleDeleteAccount}
          destructive
          colors={colors}
        />
      </View>

      {/* App Version */}
      <View style={[styles.card, { backgroundColor: 'transparent' }]}>
        <SettingsRow
          icon="information-circle-outline"
          label={STRINGS.SETTINGS.APP_VERSION}
          trailingText={APP_VERSION}
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
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.xs,
  },
});
