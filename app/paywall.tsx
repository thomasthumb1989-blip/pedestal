import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, ColorTheme, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

type PlanId = 'monthly' | 'annual' | 'lifetime';

type PlanOption = {
  id: PlanId;
  label: string;
  price: string;
  badge?: string;
};

const PLANS: PlanOption[] = [
  { id: 'annual', label: STRINGS.PAYWALL.ANNUAL_LABEL, price: STRINGS.PAYWALL.ANNUAL_PRICE, badge: STRINGS.PAYWALL.ANNUAL_SAVING },
  { id: 'monthly', label: STRINGS.PAYWALL.MONTHLY_LABEL, price: STRINGS.PAYWALL.MONTHLY_PRICE },
  { id: 'lifetime', label: STRINGS.PAYWALL.LIFETIME_LABEL, price: STRINGS.PAYWALL.LIFETIME_PRICE },
];

const FEATURES = [
  STRINGS.PAYWALL.FEATURE_RECORDINGS,
  STRINGS.PAYWALL.FEATURE_AI,
  STRINGS.PAYWALL.FEATURE_DRILLS,
  STRINGS.PAYWALL.FEATURE_IMPROMPTU,
];

type PlanCardProps = {
  plan: PlanOption;
  selected: boolean;
  colors: ColorTheme;
  onPress: () => void;
};

function PlanCard({ plan, selected, colors, onPress }: PlanCardProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.planCard,
        {
          backgroundColor: selected ? colors.primaryLight : colors.surfaceElevated,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 2 : 1,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.planLeft}>
        <View
          style={[
            styles.radio,
            {
              borderColor: selected ? colors.primary : colors.textTertiary,
              backgroundColor: selected ? colors.primary : 'transparent',
            },
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.planText}>
          <Text style={[Typography.h3, { color: colors.text }]}>{plan.label}</Text>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>{plan.price}</Text>
        </View>
      </View>

      {plan.badge && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={[Typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>
            {plan.badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function PaywallScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePurchase() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Replace with RevenueCat purchasePackage
      // const offerings = await Purchases.getOfferings();
      // const pkg = offerings.current?.availablePackages.find(p => p.identifier === selectedPlan);
      // if (pkg) await Purchases.purchasePackage(pkg);

      // Placeholder: simulate success for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e?.userCancelled) {
        // User cancelled — do nothing
      } else {
        setMessage(STRINGS.PAYWALL.ERROR);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestoring(true);
    setMessage(null);

    try {
      // TODO: Replace with RevenueCat restorePurchases
      // const customerInfo = await Purchases.restorePurchases();
      // if (customerInfo.entitlements.active['pro']) {
      //   router.replace('/(tabs)');
      //   return;
      // }

      // Placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage(STRINGS.PAYWALL.NO_PURCHASES);
    } catch {
      setMessage(STRINGS.PAYWALL.ERROR);
    } finally {
      setRestoring(false);
    }
  }

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {/* Close button */}
      <View style={[styles.closeRow, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={handleClose} hitSlop={16} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.paywallLogo}
          contentFit="contain"
        />
        <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: Spacing.lg }]}>
          {STRINGS.PAYWALL.TITLE}
        </Text>
        <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }]}>
          {STRINGS.PAYWALL.SUBTITLE}
        </Text>
      </View>

      {/* Feature list */}
      <View style={styles.features}>
        {FEATURES.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.sm, flex: 1 }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Plan cards */}
      <View style={styles.plans}>
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlan === plan.id}
            colors={colors}
            onPress={() => setSelectedPlan(plan.id)}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Pressable
          onPress={handlePurchase}
          disabled={loading || restoring}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: colors.primary,
              opacity: loading || restoring ? 0.6 : pressed ? 0.9 : 1,
              transform: [{ scale: pressed && !loading ? 0.97 : 1 }],
            },
          ]}
        >
          <Text style={[Typography.button, { color: '#FFFFFF', textTransform: 'uppercase' }]}>
            {loading ? STRINGS.PAYWALL.LOADING : STRINGS.PAYWALL.CTA}
          </Text>
        </Pressable>

        <Text style={[Typography.caption, { color: colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm }]}>
          {STRINGS.PAYWALL.TERMS}
        </Text>

        {message && (
          <Text style={[Typography.caption, { color: colors.error, textAlign: 'center', marginTop: Spacing.sm }]}>
            {message}
          </Text>
        )}
      </View>

      {/* Restore */}
      <Pressable
        onPress={handleRestore}
        disabled={loading || restoring}
        style={styles.restoreButton}
      >
        <Text style={[Typography.body, { color: colors.textSecondary, textDecorationLine: 'underline' }]}>
          {restoring ? STRINGS.PAYWALL.RESTORING : STRINGS.PAYWALL.RESTORE}
        </Text>
      </Pressable>

      {/* Legal */}
      <Text style={[Typography.caption, { color: colors.textTertiary, textAlign: 'center', paddingHorizontal: Spacing.lg, marginTop: Spacing.md }]}>
        {STRINGS.PAYWALL.LEGAL}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  paywallLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  features: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plans: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    marginLeft: Spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  ctaSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xl,
  },
  ctaButton: {
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
});
