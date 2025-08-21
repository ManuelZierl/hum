#!/usr/bin/env bash
set -euo pipefail

# Build the Rust workspace for a given Android architecture.
# Usage: ./build-android.sh [arch]
# Example: ./build-android.sh arm64-v8a
# Defaults to arm64-v8a if no argument is provided.

ARCH=${1:-arm64-v8a}

# Determine script and workspace directories
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
WORKSPACE_DIR="$SCRIPT_DIR/.."
OUTPUT_DIR="$WORKSPACE_DIR/target/android/$ARCH"

# Ensure required tools are available
command -v cargo >/dev/null 2>&1 || { echo "cargo is required but not installed."; exit 1; }
command -v rustup >/dev/null 2>&1 || { echo "rustup is required but not installed."; exit 1; }
command -v cargo-ndk >/dev/null 2>&1 || { echo "cargo-ndk is required. Install with 'cargo install cargo-ndk'."; exit 1; }

# Map common Android architectures to Rust target triples
case "$ARCH" in
  arm64-v8a) TARGET_TRIPLE=aarch64-linux-android ;;
  armeabi-v7a) TARGET_TRIPLE=armv7-linux-androideabi ;;
  x86_64) TARGET_TRIPLE=x86_64-linux-android ;;
  x86) TARGET_TRIPLE=i686-linux-android ;;
  *) echo "Unsupported Android architecture: $ARCH"; exit 1 ;;
esac

# Verify the Rust target is installed
if ! rustup target list --installed | grep -q "$TARGET_TRIPLE"; then
  echo "Rust target $TARGET_TRIPLE is not installed. Install it with: rustup target add $TARGET_TRIPLE"
  exit 1
fi

# Run the build
cd "$WORKSPACE_DIR"
echo "Building for Android architecture $ARCH ($TARGET_TRIPLE)..."
cargo ndk --target "$ARCH" --output-dir "$OUTPUT_DIR" build --release

echo "Build artifacts are located in $OUTPUT_DIR"
