#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
CRATE_DIR="$SCRIPT_DIR/.."
OUT_DIR="$CRATE_DIR/out/android"

mkdir -p "$OUT_DIR"

if command -v cargo >/dev/null 2>&1 && cargo ndk --version >/dev/null 2>&1; then
  echo "Building Android library for arm64-v8a"
  cargo ndk -t arm64-v8a -o "$OUT_DIR" build --release --manifest-path "$CRATE_DIR/Cargo.toml" --package matrix_core
else
  echo "cargo-ndk not installed; skipping Android build."
  echo "Output directory prepared at $OUT_DIR"
fi
