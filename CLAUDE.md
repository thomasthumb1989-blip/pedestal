# App V2

## Stack
- Expo SDK 56, React Native, TypeScript
- expo-router (file-based routing)
- expo-dev-client (development builds)
- react-native-purchases (RevenueCat)

## Bundle ID
`uk.karamafandi.appv2` (iOS + Android)

## Project Rules

### Code Style
- TypeScript strict mode. No `any` types.
- Functional components only. No class components.
- Use `expo-image` instead of RN `Image`.
- Use `expo-secure-store` for sensitive data, `@react-native-async-storage/async-storage` for non-sensitive.
- Use `expo-haptics` for tactile feedback on key interactions.

### File Structure
- Routes live in `app/` (expo-router file-based routing).
- Reusable components in `components/`.
- Constants/theme in `constants/`.
- Hooks in `hooks/`.
- Types in `types/`.
- Utils/helpers in `utils/`.
- Services/API calls in `services/`.

### Navigation
- expo-router handles all navigation. No manual `react-navigation` setup.
- Use typed routes (`experiments.typedRoutes` enabled in app.json).

### State Management
- Start with React Context + hooks. Add Zustand only if needed.

### Builds
- Use EAS Build for all builds. Never build locally unless debugging native issues.
- `eas build --profile development` for dev builds.
- `eas build --profile preview` for internal testing.
- `eas build --profile production` for store submissions.

### Git
- After making code changes, prompt: "Want me to commit?"
- After committing, prompt: "Want me to push?"
- Never commit or push without explicit user approval.
