export const STRINGS = {
  APP_NAME: 'Pedestal: Speech Coach',
  APP_SUBTITLE: 'Reduce Filler Words Faster',

  ONBOARDING: {
    SCREEN_1_TITLE: 'Speak with confidence',
    SCREEN_1_BODY: 'Record yourself and get instant AI feedback',
    SCREEN_2_TITLE: 'Know what to fix',
    SCREEN_2_BODY: 'Not just what\'s wrong, but exactly how to improve',
    SCREEN_3_TITLE: 'Track your growth',
    SCREEN_3_BODY: 'Watch your skills improve session by session',
    NEXT: 'Next',
    SKIP: 'Skip',
    GET_STARTED: 'Get Started',
  },

  TABS: {
    PRACTICE: 'Practice',
    PROGRESS: 'Progress',
    LEARN: 'Learn',
    SETTINGS: 'Settings',
  },

  PRACTICE: {
    TAP_TO_START: 'Tap to start practicing',
    RECORDING: 'Recording...',
    TAP_TO_STOP: 'Tap to stop',
    MIN_DURATION: 'Record at least 10 seconds',
    ANALYZING: 'Analyzing your speech...',
  },

  RESULTS: {
    TITLE: 'Session Results',
    CLARITY_SCORE: 'Clarity Score',
    WORDS_PER_MINUTE: 'Words / Min',
    FILLER_WORDS: 'Filler Words',
    DURATION: 'Duration',
    WPM_GOOD: '130-160 is ideal',
    TRANSCRIPT_TITLE: 'Your Transcript',
    PRACTICE_AGAIN: 'Practice Again',
    VIEW_TIPS: 'View Tips',
    TIPS_TITLE: 'Tips for You',
    TIP_SLOW_DOWN: 'Try slowing down. Pausing between thoughts sounds more confident than rushing.',
    TIP_SPEED_UP: 'You spoke slowly. Try increasing your energy and pace slightly.',
    TIP_FILLERS: 'Replace filler words with a brief pause. Silence sounds more powerful than "um".',
    TIP_CLARITY: 'Great clarity! Keep practicing to maintain this level.',
    TIP_GOOD_PACE: 'Your pace is in the ideal range. Keep it up!',
  },

  PROGRESS: {
    TITLE: 'Your Progress',
    EMPTY_TITLE: 'No sessions yet',
    EMPTY_BODY: 'Complete your first session to see your progress here',
  },

  LEARN: {
    TITLE: 'Learn & Practice',
    EMPTY_TITLE: 'Coming soon',
    EMPTY_BODY: 'Drills and exercises coming soon',
  },

  SETTINGS: {
    TITLE: 'Settings',
    ACCOUNT: 'Account',
    SUBSCRIPTION: 'Subscription',
    RESTORE_PURCHASES: 'Restore Purchases',
    NOTIFICATIONS: 'Notifications',
    PRIVACY_POLICY: 'Privacy Policy',
    TERMS: 'Terms of Use',
    APP_VERSION: 'App Version',
  },

  PAYWALL: {
    TITLE: 'Unlock Pedestal',
    SUBTITLE: 'Start your 17-day free trial',
    MONTHLY_LABEL: 'Monthly',
    ANNUAL_LABEL: 'Annual',
    LIFETIME_LABEL: 'Lifetime',
    ANNUAL_SAVING: 'Save 50%',
    CTA: 'Start Free Trial',
    RESTORE: 'Restore Purchases',
    TERMS: 'Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.',
  },

  ERRORS: {
    RECORDING_FAILED: 'Recording failed. Please try again.',
    NETWORK_ERROR: 'No internet connection. Some features may be limited.',
    SUBSCRIPTION_ERROR: 'Unable to verify subscription. Please try again.',
    NO_API_KEY: 'Speech analysis not configured. Check your API key.',
    TRANSCRIPTION_FAILED: 'Could not analyze speech. Please try again.',
  },
} as const;
