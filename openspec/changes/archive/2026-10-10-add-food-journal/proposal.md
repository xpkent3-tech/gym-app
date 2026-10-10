# Proposal

## Why

User request: *"a food journal like Cal AI — track the food you eat and give calories and macronutrients."* Hybrid athletes under-fuel more than any other group: HYROX, football and long runs on the same week need very different carbohydrate and protein intake. Cal AI showed that snapping a photo removes the friction that makes people abandon food logs. Calories in vs. training load out is also the missing half of the body-composition story (body fat from Apple Health comes next).

## What Changes

- New **Food** tab (replacing the Friends tab, which moves to a button on Rank and the Home feed). It shows a calorie ring (eaten vs. target), protein/carb/fat bars, meals (Breakfast, Lunch, Dinner, Snacks) and day navigation.
- **Four ways to log**, Cal AI-style:
  1. **Snap**: take or choose a photo, and AI estimates every item with grams, kcal and macros.
  2. **Describe**: "2 eggs, toast and a banana" is parsed into items.
  3. **Search** a built-in database of common foods (including athlete staples).
  4. **Quick add**: kcal and macros by hand.

  Every result opens a review screen where portions can be adjusted before saving.
- **Daily targets** from body weight, height, sex, age and goal (lose / maintain / gain), using Mifflin-St Jeor or Katch-McArdle when body fat is known. They're adjusted for the day's training load, with protein at 1.8 g/kg for hybrid athletes.
- **AI proxy** (`server/food-ai`): a small Node service that calls Claude (vision + structured outputs) so the API key never ships in the app. The app reads its URL from `EXPO_PUBLIC_FOOD_AI_URL`. Without it, photo logging explains how to enable it, and Describe falls back to the on-device parser.

Out of scope: barcode scanning, micronutrients, recipes, water tracking.

## Capabilities

### New Capabilities
- `food-journal`: food logging (photo, text, search, manual), daily targets, the day view and the AI estimation service contract.

## Impact

- Store: `food: FoodEntry[]`, `profile.body` (weight, height) and `profile.nutritionGoal`; migration defaults.
- New dependencies: `expo-image-picker` (app) and `@anthropic-ai/sdk` + `zod` (server only).
- Tabs: Home, Plan, +, Food, Rank. Friends moves to `/friends`.
