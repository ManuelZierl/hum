#!/usr/bin/env bash
set -euo pipefail

# Build the Rust workspace for a given iOS target.
# Usage: ./build-ios.sh [target]
# Example: ./build-ios.sh aarch64-apple-ios
# Defaults to aarch64-apple-ios if no argument is provided.

TARGET=${1:-aarch64-apple-ios}

# Determine script and workspace directories
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
WORKSPACE_DIR="$SCRIPT_DIR/.."
OUTPUT_DIR="$WORKSPACE_DIR/target/ios/$TARGET"

# Ensure required tools are available
command -v cargo >/dev/null 2>&1 || { echo "cargo is required but not installed."; exit 1; }
command -v rustup >/dev/null 2>&1 || { echo "rustup is required but not installed."; exit 1; }
command -v xcodebuild >/dev/null 2>&1 || { echo "xcodebuild is required. Install Xcode command-line tools."; exit 1; }

# Verify the Rust target is installed
if ! rustup target list --installed | grep -q "$TARGET"; then
  echo "Rust target $TARGET is not installed. Install it with: rustup target add $TARGET"
  exit 1
fi

# Run the build
cd "$WORKSPACE_DIR"
echo "Building for iOS target $TARGET..."
cargo build --release --target "$TARGET" --target-dir "$OUTPUT_DIR"

echo "Build artifacts are located in $OUTPUT_DIR"
