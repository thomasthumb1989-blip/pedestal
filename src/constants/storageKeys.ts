/**
 * Centralized AsyncStorage keys.
 * Every key the app reads/writes lives here — no duplicates, no typos.
 */
export const STORAGE_KEYS = {
  SUBSCRIPTION: '@pedestal_subscribed',
  ONBOARDING: '@pedestal_onboarding_complete',
  AI_CONSENT: '@pedestal_ai_consent',
  SESSIONS: '@pedestal_sessions',
  NOTIFICATIONS: '@pedestal_notifications',
} as const;
