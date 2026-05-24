import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { STRINGS } from '@/src/constants/strings';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Class component required — React has no functional error boundary API.
 * This is the only exception to the "functional components only" rule.
 */
export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRestart = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      // Use light theme for error screen (safe default)
      const colors = Colors.light;

      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="warning-outline" size={48} color={colors.error} />
          </View>

          <Text style={[Typography.h1, { color: colors.text, textAlign: 'center', marginTop: Spacing.lg }]}>
            {STRINGS.ERRORS.SOMETHING_WRONG}
          </Text>

          <Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center', lineHeight: 24, marginTop: Spacing.md, paddingHorizontal: Spacing.lg }]}>
            {STRINGS.ERRORS.ERROR_BOUNDARY_BODY}
          </Text>

          <Pressable
            onPress={this.handleRestart}
            style={({ pressed }) => [
              styles.restartButton,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
            <Text style={[Typography.button, { color: '#FFFFFF', textTransform: 'uppercase' }]}>
              {STRINGS.ERRORS.RESTART}
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
});
