#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
OUT_DIR="$PROJECT_ROOT/target/android"

mkdir -p "$OUT_DIR"

# Check for required tools
if command -v cargo >/dev/null 2>&1 && cargo ndk --help >/dev/null 2>&1; then
  echo "Building Android library for arm64-v8a..."
  cargo ndk --target arm64-v8a -o "$OUT_DIR" build --release
  echo "Artifacts located at: $OUT_DIR"
else
  echo "cargo or cargo-ndk not found; skipping build. Placeholder directory created at $OUT_DIR"
fi
