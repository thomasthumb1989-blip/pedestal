# DESIGN SYSTEM — Pedestal: Speech Coach

## Design Philosophy
Simple, calm, encouraging. The user is already nervous about public speaking — the app must feel like a safe, private practice space, not a clinical assessment tool. Every screen should have ONE clear action. If a user has to think about what to do next, the design has failed.

## Design Principles
1. One action per screen — never overwhelm
2. Big tap targets (minimum 48px) — thumbs, not precision
3. Bottom navigation only — one-handed use
4. Progressive disclosure — show basics first, details on tap
5. Celebrate progress — every session should end with positive feedback
6. Calm confidence — the design should feel premium but approachable

## Color Palette

### Light Mode
- Background: #FAFAF8 (warm off-white, not clinical)
- Surface: #FFFFFF
- Surface Elevated: #F5F3EF (warm grey for cards)
- Primary: #2D5A3D (deep forest green — calm, growth, confidence)
- Primary Light: #E8F0EB (green tint for backgrounds)
- Accent: #D4A843 (warm gold — achievement, premium feel)
- Text Primary: #1A1A1A
- Text Secondary: #6B6B6B
- Text Tertiary: #9B9B9B
- Success: #34A853 (positive feedback)
- Warning: #F4A624 (needs improvement)
- Error: #D93025 (filler word alerts)
- Border: #E8E6E1

### Dark Mode
- Background: #121212
- Surface: #1E1E1E
- Surface Elevated: #2A2A2A
- Primary: #5BA87A (lighter green for dark backgrounds)
- Primary Light: #1A2E22
- Accent: #E8C05A
- Text Primary: #F5F5F5
- Text Secondary: #A0A0A0
- Text Tertiary: #6B6B6B
- Success: #5BB974
- Warning: #F4A624
- Error: #F28B82
- Border: #333333

## Typography
- Headings: System default bold (San Francisco on iOS, Roboto on Android) — no custom fonts for v1, keeps bundle small and renders perfectly on both platforms
- H1: 28px bold (screen titles)
- H2: 22px semibold (section headers)
- H3: 18px semibold (card titles)
- Body: 16px regular (readable on all devices)
- Caption: 13px regular (secondary info)
- Button text: 16px semibold, ALL CAPS for primary actions only

## Spacing Scale (multiples of 4)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

## Border Radius
- Small (badges, chips): 8px
- Medium (cards, inputs): 12px
- Large (buttons, modals): 16px
- Full (avatars, icons): 9999px

## Shadows
- Card shadow: 0 2px 8px rgba(0,0,0,0.06)
- Elevated shadow: 0 4px 16px rgba(0,0,0,0.1)
- No heavy drop shadows — keep it flat and modern

## Component Styles

### Primary Button
- Background: Primary color
- Text: White
- Height: 52px minimum
- Full width on mobile
- Border radius: 16px
- Haptic feedback on press
- Subtle scale animation on press (0.97)

### Secondary Button
- Background: transparent
- Border: 1.5px Primary color
- Text: Primary color
- Same sizing as primary

### Cards
- Background: Surface Elevated
- Border radius: 12px
- Padding: 16px
- Shadow: Card shadow
- No borders unless interactive

### Recording Button (main CTA)
- Circular, 72px diameter
- Primary color background
- White microphone icon centered
- Pulse animation when recording
- Red background when actively recording

### Progress Indicators
- Use the Accent (gold) color for progress rings and bars
- Animate progress changes with ease-out curves
- Show percentage or score prominently in center of rings

### Metric Cards (speech analysis results)
- Clean card with single metric
- Large number (28px bold) in center
- Label below (13px caption)
- Color-coded: green (good), gold (okay), red (needs work)
- No more than 4 metrics visible at once

## Navigation
- Bottom tab bar with 3-4 tabs maximum:
  1. Practice (microphone icon) — main recording/practice screen
  2. Progress (chart icon) — history and improvement tracking
  3. Learn (book icon) — drills and exercises
  4. Settings (gear icon) — account, subscription, preferences
- Active tab: Primary color icon + label
- Inactive tab: Text Tertiary color, icon only

## Screen Layout Rules
- Safe area padding on all sides
- 16px horizontal padding on content
- Content starts below a clean header with screen title
- No hamburger menus — everything accessible from bottom tabs
- Pull-to-refresh on list screens
- Skeleton loading states, never blank screens

## Onboarding Flow
- Maximum 3 screens
- Each screen: one illustration, one headline, one sentence
- Skip button always visible
- Final screen goes straight to first recording (time-to-value under 60 seconds)

## Paywall Screen
- Show before any recording (hard paywall after trial)
- Lead with benefit: "Speak with confidence in 7 days"
- Show annual price with monthly comparison (50% saving)
- Trial duration prominent: "Try free for 17 days"
- Social proof: number of users or rating
- Restore purchases link at bottom
- Close/skip button visible (Apple requires this)

## Animation Guidelines
- Transitions: 200-300ms ease-out
- Button press: scale to 0.97, 100ms
- Screen transitions: slide from right (forward), slide from left (back)
- Recording pulse: scale 1.0 to 1.05, 1000ms infinite
- Progress changes: animate over 600ms with ease-out
- Never block interaction with animations

## Accessibility
- All tap targets minimum 48x48px
- Color is never the only indicator (always pair with icons or text)
- Support Dynamic Type scaling
- All images have alt text
- Minimum contrast ratio 4.5:1 for text

## What NOT to Do
- No gradients on backgrounds
- No more than 2 colors on any single screen
- No text over images
- No carousel/swipe navigation for core features
- No modal popups except for confirmations
- No skeleton loading that lasts more than 2 seconds
- No generic stock illustrations — use simple icons instead
- No feature tour tooltips — the UI should be self-explanatory
