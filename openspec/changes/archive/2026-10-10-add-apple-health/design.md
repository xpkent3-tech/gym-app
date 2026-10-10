# Design

## Decisions

- **`lib/health.ts`** wraps `@kingstinct/react-native-healthkit`: `healthSupported()` (iOS and `isHealthDataAvailable()`), `connectHealth()` (`requestAuthorization({ toRead })`) and `readHealthSnapshot()`. The snapshot uses `getMostRecentQuantitySample` with explicit units (kg, cm, %, count/min, ml/(kg·min)), and `queryStatisticsForQuantity(..., ['cumulativeSum'], { filter: { date: { startDate: midnight } } })` for today's steps and active energy. HealthKit reports body fat as a fraction (0.15), so values ≤ 1 are scaled to %. Every read is individually try/caught: a type the user declined just stays empty.
- **Store**: `bodyLog: BodyEntry[]` `{ id, date, weightKg, bodyFatPct?, source: 'manual' | 'health' }` and `health: { connected, snapshot?, syncedAt? }`. Adding a body entry also patches `profile.body` (weight, body fat, plus height from Health), so `dailyTargets` picks up Katch-McArdle automatically.
- **Pure metrics** in `lib/bodycomp.ts` (lean mass, BMI, FFMI with the Kouri height normalisation), unit-tested.
- The library's own `.ios` / non-iOS split keeps web and Android bundles free of native calls. Maestro covers the manual path and the "available on iPhone" state. The HealthKit path needs a device dev build (`npx expo run:ios`).

## Risks / Trade-offs

- [The HealthKit path can't run in CI/web] → it's kept thin and defensive. The README lists the manual device test: connect, deny body fat, sync.

## Iteration review (after build)

- Body composition reads as one card: weight, body fat, lean mass, BMI, FFMI and height, plus a trend line ("−1.2 kg · −0.9 % body fat since Sep 26"), which is the number athletes actually care about week to week.
- Maestro verifies that targets switch formulas: 2,390 kcal (Mifflin-St Jeor) becomes 2,482 kcal (Katch-McArdle) after a 15 % body-fat weigh-in.
- `expo-doctor` caught a latent native crash risk unrelated to this change: `@expo/vector-icons` needs `expo-font` as a direct dependency → added. All 21 checks now pass.
- Profile had grown past one screen again (body-comp card): personal records moved up next to the level, and the friend code moved into the header under the name.
- The HealthKit path is typechecked against the library's types but can only be exercised in an iOS development build (`npx expo run:ios`). The manual device test is in the README.
