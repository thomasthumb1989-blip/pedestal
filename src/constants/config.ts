export const APP_NAME = 'Pedestal: Speech Coach';
export const APP_SUBTITLE = 'Reduce Filler Words Faster';
export const BUNDLE_ID = 'com.thomasdev.pedestal';
export const APP_SCHEME = 'pedestal';
export const APP_VERSION = '1.0.0';

export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? 'appl_QeObXZUuBXbmAZnDPIeDeVNuQjb';

export const SUBSCRIPTION = {
  MONTHLY_PRICE: '£4.99',
  ANNUAL_PRICE: '£29.99',
  LIFETIME_PRICE: '£49.99',
  FREE_TRIAL_DAYS: 3,
} as const;
