import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors, Spacing, Typography } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[Typography.h2, { color: colors.text }]}>
          {STRINGS.NOT_FOUND.TITLE}
        </Text>

        <Link href="/" style={[styles.link, { color: colors.primary }]}>
          <Text style={[Typography.body, { color: colors.primary }]}>
            {STRINGS.NOT_FOUND.LINK}
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  link: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
  },
});
