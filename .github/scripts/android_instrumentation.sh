#!/usr/bin/env bash
set -euo pipefail

ADB="$ANDROID_HOME/platform-tools/adb"

echo "== ADB / env =="
$ADB version || true
echo "JAVA:"
java -version || true
echo "PWD: $(pwd)"

echo "== Wait for device =="
$ADB wait-for-device
$ADB devices || true

# Start early boot log capture (background)
mkdir -p .debug/android
$ADB logcat -v time > .debug/android/logcat_boot.txt 2>&1 &
LOGCAT_PID=$!

# Try to recover from 'offline'
for n in 1 2 3; do
  if $ADB devices | grep -q "offline"; then
    echo "Device offline → adb reconnect (try $n/3)…"
    $ADB reconnect offline || true
    sleep 2
  else
    break
  fi
done

echo "== Poll sys.boot_completed (max 8 min) =="
i=0
while :; do
  BOOT="$($ADB shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
  if [[ "$BOOT" == "1" ]]; then
    break
  fi
  ((i++))
  if (( i > 480 )); then
    echo "::error ::Emulator failed to boot within 8 minutes."
    $ADB devices || true
    $ADB shell getprop init.svc.bootanim || true
    kill "$LOGCAT_PID" 2>/dev/null || true
    exit 1
  fi
  $ADB shell getprop init.svc.bootanim || true
  sleep 1
done

echo "== Emulator booted =="
$ADB shell getprop ro.build.version.sdk || true

# Disable animations defensively (emulator-runner usually does this, but double-set)
$ADB shell settings put global animator_duration_scale 0 || true
$ADB shell settings put global window_animation_scale 0 || true
$ADB shell settings put global transition_animation_scale 0 || true

# Run Gradle instrumentation
echo "== Run instrumentation build & tests =="
bash apps/mobile/android/gradlew --no-daemon --stacktrace --info \
  assembleDebug assembleAndroidTest connectedDebugAndroidTest

# Stop background logcat
kill "$LOGCAT_PID" 2>/dev/null || true

echo "::group::Test result files"
ls -R apps/mobile/android/app/build/outputs/androidTest-results || true
ls -R apps/mobile/android/app/build/reports || true
echo "::endgroup::"

echo "Done."
