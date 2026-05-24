import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { HeaderLogo } from '@/components/HeaderLogo';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = '@pedestal_onboarding_complete';

type OnboardingSlide = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

const slides: OnboardingSlide[] = [
  {
    icon: 'mic-outline',
    title: STRINGS.ONBOARDING.SCREEN_1_TITLE,
    body: STRINGS.ONBOARDING.SCREEN_1_BODY,
  },
  {
    icon: 'bulb-outline',
    title: STRINGS.ONBOARDING.SCREEN_2_TITLE,
    body: STRINGS.ONBOARDING.SCREEN_2_BODY,
  },
  {
    icon: 'trending-up-outline',
    title: STRINGS.ONBOARDING.SCREEN_3_TITLE,
    body: STRINGS.ONBOARDING.SCREEN_3_BODY,
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const iconFade = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const bodyFade = useRef(new Animated.Value(0)).current;

  const iconTranslateY = useRef(new Animated.Value(20)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const bodyTranslateY = useRef(new Animated.Value(20)).current;

  const dotWidths = useRef(
    slides.map((_, i) => new Animated.Value(i === 0 ? 24 : 8))
  ).current;

  useEffect(() => {
    iconFade.setValue(0);
    titleFade.setValue(0);
    bodyFade.setValue(0);
    iconTranslateY.setValue(20);
    titleTranslateY.setValue(20);
    bodyTranslateY.setValue(20);

    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(iconFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(iconTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bodyFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(bodyTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentIndex]);

  useEffect(() => {
    const animations = dotWidths.map((dotWidth, index) =>
      Animated.timing(dotWidth, {
        toValue: index === currentIndex ? 24 : 8,
        duration: 300,
        useNativeDriver: false,
      })
    );
    Animated.parallel(animations).start();
  }, [currentIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  async function completeOnboarding() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/paywall');
  }

  function handleNext() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  }

  function handleSkip() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
  }

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.skipContainer, { paddingHorizontal: Spacing.md }]}>
        {!isLastSlide ? (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              {STRINGS.ONBOARDING.SKIP}
            </Text>
          </Pressable>
        ) : (
          <View />
        )}
        <HeaderLogo size={32} />
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primaryLight },
                { opacity: iconFade, transform: [{ translateY: iconTranslateY }] },
              ]}
            >
              <Ionicons name={item.icon} size={64} color={colors.primary} />
            </Animated.View>
            <View
              style={[
                styles.accentLine,
                { backgroundColor: colors.accent },
              ]}
            />
            <Animated.Text
              style={[
                Typography.h1,
                styles.title,
                { color: colors.text },
                { opacity: titleFade, transform: [{ translateY: titleTranslateY }] },
              ]}
            >
              {item.title}
            </Animated.Text>
            <Animated.Text
              style={[
                Typography.body,
                styles.body,
                { color: colors.textSecondary },
                { opacity: bodyFade, transform: [{ translateY: bodyTranslateY }] },
              ]}
            >
              {item.body}
            </Animated.Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidths[index],
                  backgroundColor: index === currentIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
            isLastSlide && styles.nextButtonLast,
            isLastSlide && Shadows.elevated,
          ]}
        >
          <Text style={[Typography.button, styles.nextButtonText]}>
            {isLastSlide ? STRINGS.ONBOARDING.GET_STARTED : STRINGS.ONBOARDING.NEXT}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  accentLine: {
    height: 3,
    width: 40,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: Spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonLast: {
    height: 60,
  },
  nextButtonText: {
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});
