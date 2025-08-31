#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

usage() {
  cat <<'USAGE'
Usage: build-ios.sh --out <dir> [--release]

Build an iOS xcframework and Swift Package Manager bundle.

Options:
  --out <dir>     Output directory for generated artifacts
  --release       Build in release mode
  -h, --help      Show this help message and exit
USAGE
}

out=""
release=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out)
      out="$2"
      shift 2
      ;;
    --release)
      release="--release"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$out" ]]; then
  echo "Missing required --out argument" >&2
  usage >&2
  exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild is required" >&2
  exit 1
fi

mkdir -p "$out"

profile="debug"
[[ -n "$release" ]] && profile="release"

package="ffi"

targets=(aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios-sim)
for t in "${targets[@]}"; do
  cargo build -p "$package" --target "$t" $release
done

libs=()
for t in "${targets[@]}"; do
  libs+=( -library "target/$t/$profile/lib${package}.a" )
done

xcodebuild -create-xcframework "${libs[@]}" -output "$out/${package}.xcframework"

spm_dir="$out/${package}Package"
mkdir -p "$spm_dir"
cat > "$spm_dir/Package.swift" <<SWIFT
// swift-tools-version:5.7
import PackageDescription
let package = Package(
    name: "$package",
    platforms: [.iOS(.v13)],
    products: [
        .library(name: "$package", targets: ["$package"])
    ],
    targets: [
        .binaryTarget(name: "$package", path: "../${package}.xcframework")
    ]
)
SWIFT
