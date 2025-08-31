#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

usage() {
  cat <<'USAGE'
Usage: gen-bindings.sh --udl <file> --out <dir>

Generate Swift and Kotlin bindings using UniFFI.

Options:
  --udl <file>    Path to the UniFFI UDL file
  --out <dir>     Output directory for generated bindings
  -h, --help      Show this help message and exit
USAGE
}

udl=""
out=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --udl)
      udl="$2"
      shift 2
      ;;
    --out)
      out="$2"
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

if [[ -z "$udl" || -z "$out" ]]; then
  echo "Both --udl and --out are required" >&2
  usage >&2
  exit 1
fi

if ! command -v uniffi-bindgen >/dev/null 2>&1; then
  echo "uniffi-bindgen not found" >&2
  exit 1
fi

mkdir -p "$out/swift" "$out/kotlin"

uniffi-bindgen generate "$udl" --language swift --out-dir "$out/swift"
uniffi-bindgen generate "$udl" --language kotlin --out-dir "$out/kotlin"
