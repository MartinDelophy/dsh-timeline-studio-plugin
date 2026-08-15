#!/bin/sh

set -eu

MODE="check"
ASSUME_YES="false"
for ARGUMENT in "$@"; do
  case "$ARGUMENT" in
    --check) MODE="check" ;;
    --install) MODE="install" ;;
    --yes) ASSUME_YES="true" ;;
    *) echo "Usage: sh scripts/bootstrap-host.sh [--check|--install] [--yes]" >&2; exit 2 ;;
  esac
done

version_of() {
  "$1" --version 2>/dev/null | head -n 1 | sed -E 's/[^0-9]*([0-9]+\.[0-9]+(\.[0-9]+)?).*/\1/'
}

version_at_least() {
  awk -v actual="$1" -v minimum="$2" 'BEGIN {
    split(actual, a, "."); split(minimum, b, ".");
    for (i = 1; i <= 3; i++) {
      av = a[i] + 0; bv = b[i] + 0;
      if (av > bv) exit 0;
      if (av < bv) exit 1;
    }
    exit 0;
  }'
}

NODE_VERSION=""
PYTHON_COMMAND=""
PYTHON_VERSION=""
if command -v node >/dev/null 2>&1; then NODE_VERSION="$(version_of node)"; fi
if command -v python3 >/dev/null 2>&1; then PYTHON_COMMAND="python3"; PYTHON_VERSION="$(version_of python3)";
elif command -v python >/dev/null 2>&1; then PYTHON_COMMAND="python"; PYTHON_VERSION="$(version_of python)"; fi

NODE_OK="false"
PYTHON_OK="false"
if [ -n "$NODE_VERSION" ] && version_at_least "$NODE_VERSION" "22.20.0"; then NODE_OK="true"; fi
if [ -n "$PYTHON_VERSION" ] && version_at_least "$PYTHON_VERSION" "3.10.0"; then PYTHON_OK="true"; fi

echo "Timeline Studio language runtimes"
if [ "$NODE_OK" = "true" ]; then echo "✓ Node.js $NODE_VERSION"; else echo "✗ Node.js ${NODE_VERSION:-missing} (requires >= 22.20.0)"; fi
if [ "$PYTHON_OK" = "true" ]; then echo "✓ Python $PYTHON_VERSION ($PYTHON_COMMAND)"; else echo "✗ Python ${PYTHON_VERSION:-missing} (requires >= 3.10.0)"; fi

if [ "$NODE_OK" = "true" ] && [ "$PYTHON_OK" = "true" ]; then exit 0; fi
if [ "$MODE" != "install" ]; then exit 1; fi

SYSTEM_NAME="$(uname -s)"
echo ""
echo "Proposed language-runtime changes:"
case "$SYSTEM_NAME" in
  Darwin)
    if ! command -v brew >/dev/null 2>&1; then
      echo "Homebrew is unavailable. Install a trusted package manager or Node.js >= 22.20.0 and Python >= 3.10 manually." >&2
      exit 2
    fi
    if [ "$NODE_OK" != "true" ]; then echo "- brew install node@22"; fi
    if [ "$PYTHON_OK" != "true" ]; then echo "- brew install python@3.11"; fi
    ;;
  Linux)
    if ! command -v apt-get >/dev/null 2>&1; then
      echo "Automatic Linux bootstrap currently requires apt-get." >&2
      exit 2
    fi
    if [ "$NODE_OK" != "true" ]; then echo "- sudo apt-get install -y nodejs npm (must verify >= 22.20.0 afterward)"; fi
    if [ "$PYTHON_OK" != "true" ]; then echo "- sudo apt-get install -y python3 python3-venv python3-pip"; fi
    ;;
  *)
    echo "Unsupported Unix platform: $SYSTEM_NAME" >&2
    exit 2
    ;;
esac
echo "No shell profile, model cache, credentials, or paid service will be changed."

if [ "$ASSUME_YES" != "true" ]; then
  if [ ! -t 0 ]; then
    echo "Interactive confirmation required. Use --yes only after explicit user approval." >&2
    exit 2
  fi
  printf "Apply this plan? [y/N] "
  read -r ANSWER
  case "$ANSWER" in y|Y|yes|YES) ;; *) exit 3 ;; esac
fi

case "$SYSTEM_NAME" in
  Darwin)
    if [ "$NODE_OK" != "true" ]; then brew install node@22; fi
    if [ "$PYTHON_OK" != "true" ]; then brew install python@3.11; fi
    ;;
  Linux)
    sudo apt-get update
    if [ "$NODE_OK" != "true" ]; then sudo apt-get install -y nodejs npm; fi
    if [ "$PYTHON_OK" != "true" ]; then sudo apt-get install -y python3 python3-venv python3-pip; fi
    ;;
esac

if ! command -v node >/dev/null 2>&1 || ! version_at_least "$(version_of node)" "22.20.0"; then
  echo "Node.js remains below 22.20.0. The distribution package was not sufficient; stop and install a trusted newer runtime." >&2
  exit 1
fi
if command -v python3 >/dev/null 2>&1; then PYTHON_COMMAND="python3"; else PYTHON_COMMAND="python"; fi
if ! command -v "$PYTHON_COMMAND" >/dev/null 2>&1 || ! version_at_least "$(version_of "$PYTHON_COMMAND")" "3.10.0"; then
  echo "Python remains below 3.10.0 after installation." >&2
  exit 1
fi
echo "Language runtimes ready. Continue with: node scripts/setup-host.mjs --check"
