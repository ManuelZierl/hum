# Development Setup

## Android Rust (cargo-ndk) prerequisites

- Install Android SDK + NDK (via Android Studio or command line). Note the NDK path.
- Install cargo-ndk and ndk targets:

```
cargo install cargo-ndk
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
```

- Ensure `ANDROID_NDK_HOME` or `ANDROID_NDK_ROOT` points to your NDK.

## Building the Rust libs

Use the helper script:

```
bash native/rust/scripts/build-android.sh --out native/rust/build/android --release
```

Outputs:

- `.so` files under `native/rust/build/android/jniLibs/<abi>/`
- `ffi.aar` bundle in the same output directory

## Integrations

Two supported flows for development:

1. Package into the RN module (preferred)

- Set `HUM_RUST_REPO_ROOT` to the repo root path when building the Android app so the Gradle task can run the Rust build script and copy outputs:

```
export HUM_RUST_REPO_ROOT=$(pwd)
./gradlew :app:assembleDebug
```

- Alternatively, prebuild to a custom folder and point `HUM_RUST_ANDROID_OUT` at it:

```
bash native/rust/scripts/build-android.sh --out /tmp/hum-rust-android --release
export HUM_RUST_ANDROID_OUT=/tmp/hum-rust-android
./gradlew :app:assembleDebug
```

The module `@hum/hum-matrix-native` will copy `jniLibs` into `packages/hum-matrix-native/android/src/main/jniLibs/` during build.

2. Copy directly into the app via Expo config plugin

- Build Rust as above, then enable the plugin:

```
export WITH_HUM_RUST=true
export HUM_RUST_ANDROID_OUT=$(pwd)/native/rust/build/android
npx expo prebuild
```

The plugin copies `jniLibs` into `apps/mobile/android/app/src/main/jniLibs/`.

## iOS Rust (xcframework) prerequisites

- Install Xcode command line tools; ensure `xcodebuild` is available.
- Ensure Rust is installed; iOS targets will be invoked by the script.

## Building the iOS xcframework

```
bash native/rust/scripts/build-ios.sh --out native/rust/build/ios --release
```

This creates `native/rust/build/ios/ffi.xcframework`.

## Integrating the xcframework

Preferred flow is via the RN module + Podspec:

```
export WITH_HUM_RUST=true
export HUM_RUST_IOS_OUT=$(pwd)/native/rust/build/ios
npx expo prebuild
cd apps/mobile/ios && pod install
```

The config plugin copies `ffi.xcframework` and `hum.h` into `packages/hum-matrix-native/ios/`, and the Podspec vends them to the app.
