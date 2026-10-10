#!/usr/bin/env bash
# One-shot local setup for the Stride gym app (macOS / Linux).
# Usage:  bash setup.sh
set -euo pipefail

REPO="https://github.com/xpkent3-tech/gym-app"
BRANCH="claude/gallant-gauss-r74iut"

if [ ! -f package.json ]; then
  git clone --branch "$BRANCH" "$REPO" gym-app
  cd gym-app
else
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

command -v node >/dev/null || { echo "Install Node 20+ first (https://nodejs.org)"; exit 1; }
[ "$(node -p 'process.versions.node.split(".")[0]')" -ge 20 ] || { echo "Node 20+ required"; exit 1; }

npm install
npx expo install --check || true
npm run typecheck && npm test

cat <<'MSG'

Setup done. Next:
  npx expo start          # press i (iOS sim), a (Android), w (web), or scan the QR in Expo Go
  npm run e2e             # Maestro web tests (run bash scripts/setup-maestro.sh once first)
Apple Health needs a dev build:  npx expo run:ios
Food photo AI: see server/food-ai/README.md (needs ANTHROPIC_API_KEY)
MSG
