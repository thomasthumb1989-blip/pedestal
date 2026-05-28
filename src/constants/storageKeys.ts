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
  FREE_SESSION_COUNT: '@pedestal_free_session_count',
  FIRST_SUBSCRIBED_DATE: '@pedestal_first_subscribed_date',
  REVIEW_PROMPTED: '@pedestal_review_prompted',
} as const;
