# PROJECT RULES

## Developer Setup
- Developer: Karam Afandi, Wales, UK
- Machine: Windows laptop — NO Mac, NO iPhone
- Phone: Google Pixel Pro 10 XL (primary test device)
- IDE: Claude Code via Claude Desktop
- Framework: React Native + Expo SDK 56 + TypeScript
- Build: EAS Build (cloud builds for iOS, local/cloud for Android)
- ASO Tool: Applyra (full subscription, API key in env)
- First app shipped: UnSub: Subscription Tracker (live on App Store)

## Code Rules
- TypeScript only. Never create .js or .jsx files
- Functional components only. No class components
- expo-router for all navigation (file-based routing)
- Use expo-dev-client for development. Never use Expo Go
- Never eject from Expo managed workflow
- react-native-purchases (RevenueCat) for all subscriptions and IAP
- AsyncStorage for local data. expo-secure-store for sensitive data
- All user-facing text goes in src/constants/strings.ts for future localization
- PascalCase for components, camelCase for functions/variables, UPPER_SNAKE_CASE for constants
- Always handle errors with try/catch in async functions
- Always add loading states for async operations
- Always add haptic feedback on button presses (expo-haptics)

## Build & Testing Workflow
- Always test on Android dev build on Pixel FIRST
- Android must pass before triggering any iOS EAS build
- Development builds: Android APK for direct install on Pixel
- Preview builds: TestFlight (iOS) + internal track (Android)
- Production builds: App Store + Google Play
- Auto-increment build numbers enabled in eas.json

## App Store Rules (Apple)
- Privacy Policy URL must be live before submission
- App Privacy nutrition label must be completed accurately
- Account deletion must be available if accounts exist
- Subscription terms (price, renewal, cancellation) visible before purchase
- If using third-party AI (OpenAI, Anthropic etc), must show consent modal naming the provider
- Sign in with Apple required IF you offer Google/Facebook login
- Privacy Manifest (PrivacyInfo.xcprivacy) required for all third-party SDKs
- Screenshots must show real app UI — no mockups, no placeholder data
- App must work on clean install — no debug builds, no Coming Soon screens
- Provide test credentials in App Store Connect review notes if app has login
- Never use trademarked terms in metadata or keyword field

## Google Play Rules (Android)
- Data Safety form must be completed
- Account deletion required if accounts exist
- Minimal permissions only — block location/audio/camera unless genuinely needed
- Target API level must meet Google's current requirement

## ASO Rules (from 2025-2026 research)
- Title: 30 chars max. Brand name + one primary keyword
- Subtitle: 30 chars max. Never repeat keywords from title
- Keyword field: 100 chars, comma-separated, no spaces after commas
- Never repeat keywords across title + subtitle + keyword field — Apple combines them
- Singulars only — Apple matches plurals automatically
- No stop words (the, and, with, for, a)
- No competitor brand names or trademarks
- Localization trick: Add English (Australia) localization to UK storefront to double keyword pool to 200 chars
- Screenshot captions are now indexed by Apple via OCR — use keyword-rich captions
- First 3 screenshots do 90% of conversion work
- Screenshots: 1290x2796 (6.9" iPhone), 2064x2752 (13" iPad)
- Create 3 Custom Product Pages on launch day with different keyword clusters
- Update metadata every 4 weeks
- Respond to every review within 48 hours
- Ship meaningful updates every 2 weeks — update frequency is a ranking factor
- Conversion rate is a direct ranking factor — optimize product page like a landing page

## Monetization Rules
- Use hard paywall with free trial — NOT freemium
- Hard paywall converts 10.7% vs 2.1% freemium (5x gap)
- Revenue per install: $3.09 hard paywall vs $0.38 freemium (8x gap)
- Pricing: £4.99/month or £29.99/year (show 50% saving prominently)
- Optional: £49.99 lifetime as third option
- Free trial: 17-32 days (sweet spot for conversion)
- Never use weekly subscriptions — 65% cancel in 30 days
- Annual plans work best for Health & Fitness (68% of revenue)
- Monthly plans work best for Productivity (77% of revenue)
- RevenueCat is free up to $2,500 MTR then 1% of revenue

## UK Tax & Business
- Enrolled in Apple Small Business Program (30% → 15% commission)
- W-8BEN submitted (not W-9) for 0% US withholding tax
- Apple Developer fee (£99/yr) is tax deductible
- All tools (RevenueCat, Applyra, Claude Pro) are deductible business expenses
- Apple collects VAT for UK digital sales — no VAT registration needed unless turnover exceeds £90K
- Declare app revenue as self-employment trading income on UK Self Assessment

## Realistic Benchmarks
- Only 17.3% of new subscription apps reach $1K MRR within 2 years
- Realistic success: $2-5K/month within 12 months
- If below $500 MRR at 90 days: pivot or kill
- If $2-5K MRR at 6 months: double down on ASO and retention
- If above $5K MRR at 12 months: localize to Japan, Germany, France

## Gotchas Found
(Add every bug, API quirk, or build error you hit here as you go)
