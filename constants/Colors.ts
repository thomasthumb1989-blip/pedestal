export const Colors = {
  light: {
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F3EF',
    primary: '#2D5A3D',
    primaryLight: '#E8F0EB',
    accent: '#D4A843',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    textTertiary: '#9B9B9B',
    success: '#34A853',
    warning: '#F4A624',
    error: '#D93025',
    border: '#E8E6E1',
    tint: '#2D5A3D',
    tabIconDefault: '#9B9B9B',
    tabIconSelected: '#2D5A3D',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceElevated: '#2A2A2A',
    primary: '#5BA87A',
    primaryLight: '#1A2E22',
    accent: '#E8C05A',
    text: '#F5F5F5',
    textSecondary: '#A0A0A0',
    textTertiary: '#6B6B6B',
    success: '#5BB974',
    warning: '#F4A624',
    error: '#F28B82',
    border: '#333333',
    tint: '#5BA87A',
    tabIconDefault: '#6B6B6B',
    tabIconSelected: '#5BA87A',
  },
} as const;

export type ColorTheme = (typeof Colors)['light'] | (typeof Colors)['dark'];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;
