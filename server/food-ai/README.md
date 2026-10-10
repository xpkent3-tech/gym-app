# Stride food AI proxy

Turns a meal photo and/or description into calories and macros with Claude (vision + structured outputs). The app never sees the API key.

```bash
cd server/food-ai
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start        # listens on :8787
# optional: FOOD_AI_TOKEN=some-secret  (the app sends it as a Bearer token)
```

Point the app at it with `EXPO_PUBLIC_FOOD_AI_URL=http://<host>:8787` (and `EXPO_PUBLIC_FOOD_AI_TOKEN` if set).

`POST /analyze` with `{ "imageBase64"?: string, "mediaType"?: "image/jpeg", "text"?: string }` → `{ items: [{ name, grams, kcal, protein_g, carbs_g, fat_g }], confidence, notes }`. Declined requests return 422.

Model: `claude-opus-5-5` at `effort: "low"`, with server-side refusal fallback enabled (`fallbacks: "default"`).
