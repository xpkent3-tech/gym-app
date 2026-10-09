#!/usr/bin/env bash
# Builds the web export and runs every Maestro flow in .maestro/ against it in headless Chromium.
# Usage: npm run e2e [-- <flow file or dir>]
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${E2E_PORT:-8081}"
export PATH="$HOME/.maestro/bin:$HOME/.maestro/maestro/bin:$PATH"

if [ "${SKIP_EXPORT:-0}" != "1" ]; then
  npx expo export --platform web --output-dir dist >/dev/null
fi

if curl -sf "http://localhost:$PORT" >/dev/null; then echo "Port $PORT is busy; set E2E_PORT" >&2; exit 1; fi
node scripts/serve.mjs dist "$PORT" &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 50); do curl -sf "http://localhost:$PORT" >/dev/null && break; sleep 0.2; done

maestro test --headless -e APP_URL="http://localhost:$PORT" --screen-size 430x1400 --test-output-dir .maestro/output "${@:-.maestro}"
