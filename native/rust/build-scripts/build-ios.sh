#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
CRATE_DIR="$SCRIPT_DIR/.."
OUT_DIR="$CRATE_DIR/out/ios"

mkdir -p "$OUT_DIR"

echo "Building iOS xcframework (placeholder)"
if command -v cargo >/dev/null 2>&1; then
  echo "Rust toolchain detected"
  # TODO: Add real build commands for aarch64-apple-ios and x86_64-apple-ios
  # Example:
  # cargo build --target aarch64-apple-ios --release --manifest-path "$CRATE_DIR/Cargo.toml" --package matrix_core
  # cargo build --target x86_64-apple-ios --release --manifest-path "$CRATE_DIR/Cargo.toml" --package matrix_core
  # xcodebuild -create-xcframework -library <path to libs> -output "$OUT_DIR/matrix_core.xcframework"
else
  echo "Rust toolchain not installed; skipping iOS build"
fi

touch "$OUT_DIR/.placeholder"
