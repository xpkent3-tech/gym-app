# Proposal

## Why

User request: *"connect to Apple Health for data like body fat etc."* Body composition is how hybrid athletes judge whether training and nutrition are working, and the scale or smart scale data already lives in Apple Health. It also makes the food journal smarter: with body fat known, energy needs use lean mass (Katch-McArdle) instead of a population formula. Manual entry is still required for Android/web users and people without a smart scale.

## What Changes

- **Body composition screen** (`/body-comp`, reached from Profile, the Food setup card and Settings): latest weight, body fat %, lean mass, BMI and FFMI (fat-free mass index, the lifter's "how much muscle" number), a weight/body-fat history, and manual entry.
- **Apple Health (iOS)**: Connect reads body mass, body fat %, lean body mass, height, resting heart rate, VO₂max, today's steps and active energy, and Sync refreshes them. New body readings are added to the history and update the profile, so nutrition targets follow automatically. On Android and web the card says Apple Health is iPhone-only and points to manual entry.
- **Nutrition targets** use the latest body fat % (Katch-McArdle) when available.

Out of scope: writing workouts or food to Apple Health, Android Health Connect, background sync.

## Capabilities

### New Capabilities
- `body-composition`: body metrics (manual and Apple Health), derived metrics, history, and the Apple Health connection.

## Impact

- New dependencies `@kingstinct/react-native-healthkit` + `react-native-nitro-modules` (config plugin adds the HealthKit entitlement and usage strings). These need a development build, not Expo Go. The library ships a non-iOS stub, so web/Android bundles are unaffected.
- Store: `bodyLog`, `health` (connected flag + last snapshot).
