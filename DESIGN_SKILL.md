# DESIGN SKILL — Frontend Design Principles

## Design Thinking
Before building any screen, commit to a BOLD aesthetic direction:
- Purpose: What problem does this screen solve?
- Tone: Pedestal's tone is "refined confidence" — premium, calm, encouraging, not clinical or generic
- Differentiation: What makes this screen UNFORGETTABLE?

## NEVER Do These
- Never use generic defaults — no plain grey backgrounds, no boring flat layouts
- Never use system default styling without customization
- Never create screens that look like every other app
- Never use evenly-distributed weak color palettes — use dominant colors with sharp accents
- Never skip micro-interactions — every tap should feel alive

## ALWAYS Do These
- Typography: Use distinct weight contrasts — bold headlines against light body text. Make numbers large and impactful on metric screens.
- Color: Commit to the design system palette. Use Primary (forest green) as dominant, Accent (gold) for highlights and achievements. White space is a feature, not emptiness.
- Motion: Add subtle animations — fade-ins on screen load, scale on button press, smooth transitions between screens. Use React Native Animated API.
- Spatial Composition: Use generous padding. Cards should breathe. Content should never feel cramped.
- Visual Hierarchy: One clear focal point per screen. The user's eye should know exactly where to go first.
- Polish: Shadows on cards, rounded corners, consistent spacing. The difference between amateur and pro is in the details.

## Mobile-Specific Rules
- Touch targets minimum 48x48px
- Bottom-heavy layouts — primary actions within thumb reach
- Scroll views for content that might overflow
- Pull-to-refresh on list screens
- Skeleton loading states, never blank white screens
- Haptic feedback on all interactive elements

## Screen-by-Screen Character
- Practice screen: Bold and focused. The record button is the hero. Everything else is secondary.
- Results screen: Celebratory. Big numbers, color-coded metrics, the user should feel like they accomplished something.
- Progress screen: Motivational. Show growth. Use the gold accent color for improvements.
- Learn screen: Organized and inviting. Cards should make you want to tap them.
- Settings screen: Clean and trustworthy. No clutter.
- Paywall screen: Premium and confident. This is a sales page — it must convert.
- Onboarding: Simple and fast. Get to value in under 60 seconds.
