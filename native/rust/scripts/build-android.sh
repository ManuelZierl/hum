#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

usage() {
  cat <<'USAGE'
Usage: build-android.sh --out <dir> [--release] [--package <name>]

Build Android shared libraries (.so) and an AAR using cargo-ndk.

Options:
  --out <dir>     Output directory for generated artifacts
  --release       Build in release mode
  --package <name>  Package name for Android manifest (default: com.example.ffi)
  -h, --help      Show this help message and exit
USAGE
}

out=""
release=""
package="com.example.ffi"

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
    --package)
      package="$2"
      shift 2
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

if ! command -v jar >/dev/null 2>&1; then
  echo "jar command not found" >&2
  exit 1
fi

mkdir -p "$out"

ndk_targets=(arm64-v8a armeabi-v7a x86_64)
args=(-o "$out/jniLibs")
for t in "${ndk_targets[@]}"; do
  args+=( -t "$t" )
done

cargo ndk "${args[@]}" build $release

tmpdir="$(mktemp -d)"
manifest="$tmpdir/AndroidManifest.xml"
printf '<manifest package="%s" />\n' "$package" > "$manifest"
mkdir -p "$tmpdir/empty"
jar cf "$tmpdir/classes.jar" -C "$tmpdir/empty" .
cp -r "$out/jniLibs" "$tmpdir/"
(cd "$tmpdir" && jar cf "$out/ffi.aar" AndroidManifest.xml classes.jar jniLibs)
rm -rf "$tmpdir"
