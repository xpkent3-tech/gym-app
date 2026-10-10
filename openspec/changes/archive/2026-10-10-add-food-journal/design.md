# Design

## Decisions

- **AI behind a proxy, never in the app.** A mobile binary can't keep a secret. `server/food-ai` is a ~100-line Node service (`@anthropic-ai/sdk`, `zod`). It runs one `messages.parse` call on `claude-opus-5-5` with an image block (base64 JPEG) and/or text, and `output_config.format = zodOutputFormat(MealEstimate)`, so the reply is schema-validated JSON (no prompt-parsing fragility). It uses `effort: "low"`, since this is a quick perception task and latency matters for a snap-and-log UX. A `stop_reason: "refusal"` maps to HTTP 422. CORS is open for the web build, and an optional `FOOD_AI_TOKEN` shared secret is supported.
- **The local food DB doubles as the offline parser's lexicon.** About 90 foods with kcal/P/C/F per 100 g, plus a natural unit ("1 egg = 50 g", "1 slice = 30 g"). The parser splits on `,`/`and`/`with`, reads leading quantities ("2", "a", "half", "150g") and fuzzy-matches names.
- **Targets**: BMR × 1.35 (lifestyle) + 70 % of training energy (≈ 7 kcal per sRPE load unit, Foster's method). Runs count via km × kg × 1.0 kcal. Weight and height come from `profile.body` (onboarding asks later via the Food tab setup card, and Apple Health fills them next).
- **Photo capture**: `expo-image-picker` (camera on device, file picker on web), `base64: true`, quality 0.6, so payloads stay small.

## Risks / Trade-offs

- [AI estimates can be off by 20–30 %] → the review step is mandatory, and confidence is shown.
- [Database coverage] → Describe falls back to Quick add for unknown foods, and the item reads "not found".

## Iteration review (after build)

- The food database's Atwater check (4/4/9 kcal per g) flagged beer and wine, whose calories come from alcohol → foods now carry `alcohol` grams (7 kcal/g). Fibre-heavy vegetables get a wider tolerance.
- Macro values wrapped ("94 / 135" then "g" on its own line) → compact "94/135g" on one line. "Clear meal" was a heavy red button on every meal → a subtle text action (still two-step).
- The Friends tab became Food (tabs: Home, Plan, +, Food, Rank). Friends lives at `/friends`, reached from Rank's 👥 button and the Home feed.
- The AI proxy is typechecked but not exercised end-to-end here (no API credentials in CI). Maestro covers the offline Describe path, search, quick add and the "photo AI not set up" fallback.
