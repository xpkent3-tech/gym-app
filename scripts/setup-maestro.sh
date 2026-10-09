#!/usr/bin/env bash
# One-time setup for running Maestro web e2e in a Linux container/CI:
#  - installs the Maestro CLI into ~/.maestro
#  - lets Maestro/Selenium fetch Chrome for Testing, then installs the matching chromedriver into ~/.maestro/bin
#  - when running as root, wraps Chrome with --no-sandbox (Chrome refuses to start as root otherwise)
set -euo pipefail
mkdir -p "$HOME/.maestro/bin"
if [ ! -x "$HOME/.maestro/maestro/bin/maestro" ]; then
  curl -fsSL -o /tmp/maestro.zip https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip
  unzip -qo /tmp/maestro.zip -d "$HOME/.maestro"
fi

CHROME=$(find "$HOME/.cache/selenium/chrome" -name chrome -type f 2>/dev/null | head -1 || true)
if [ -z "$CHROME" ]; then
  echo "Chrome for Testing not cached yet; run any Maestro web flow once (it downloads Chrome), then re-run this script."
  exit 0
fi
DIR=$(dirname "$CHROME")
VERSION=$(basename "$DIR")

if [ "$(id -u)" = "0" ] && [ ! -f "$DIR/chrome.real" ]; then
  mv "$DIR/chrome" "$DIR/chrome.real"
  printf '#!/bin/sh\nexec "$(dirname "$0")/chrome.real" --no-sandbox --disable-dev-shm-usage "$@"\n' > "$DIR/chrome"
  chmod +x "$DIR/chrome"
fi

if ! "$HOME/.maestro/bin/chromedriver" --version 2>/dev/null | grep -q "$VERSION"; then
  curl -fsSL -o /tmp/chromedriver.zip "https://storage.googleapis.com/chrome-for-testing-public/$VERSION/linux64/chromedriver-linux64.zip"
  unzip -qo /tmp/chromedriver.zip -d /tmp
  mv /tmp/chromedriver-linux64/chromedriver "$HOME/.maestro/bin/chromedriver"
fi
echo "Maestro web ready (Chrome $VERSION)."
