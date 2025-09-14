Dev Client Setup (Expo New Architecture + Rust FFI)

This guide shows how to build and run the app with a custom Expo Dev Client that includes the Hum native module and Rust artifacts.

Prereqs

- Xcode for iOS, Android Studio for Android
- Rust toolchain installed
- cargo-ndk installed (Android): `cargo install cargo-ndk`
- iOS: Xcode command line tools, CocoaPods

Build Rust Artifacts

- Android:
  - `npm run -w mobile rust:build:android`
  - Outputs: `native/rust/build/android/jniLibs/<abi>/libffi.so`
- iOS:
  - `npm run -w mobile rust:build:ios`
  - Outputs: `native/rust/build/ios/ffi.xcframework`

Run with Dev Client

Android (all-in-one):

```
npm run -w mobile dev:android:all
```

Environment effects:

- `WITH_HUM_RUST=true`: enables the Expo config plugin to copy JNI libs into the app
- `HUM_RUST_REPO_ROOT=../../`: Gradle task builds/copies JNI libs into the RN module
- `DEV_FEATURES=1`: shows the Dev Native Bridge screen inside the app

iOS (all-in-one):

```
npm run -w mobile dev:ios:all
```

Environment effects:

- `WITH_HUM_RUST=true`: enables the Expo config plugin
- `HUM_RUST_IOS_OUT=../../native/rust/build/ios`: plugin copies `ffi.xcframework` and `hum.h` into the RN module for Pods
- `DEV_FEATURES=1`: shows the Dev Native Bridge screen inside the app

First Run Notes

- `expo run:ios|android` will generate native projects (prebuild) and install the Dev Client.
- iOS: `pod install` runs inside `apps/mobile/ios` automatically. If the xcframework is missing, ensure you built it and that `WITH_HUM_RUST` and `HUM_RUST_IOS_OUT` are set.

Verify at Runtime

- The app should launch. With `DEV_FEATURES=1`, a small pink circular button (testID `btnOpenDev`) appears in the top-right.
- Tap it to open the Dev Native Bridge screen.
- Use the buttons to call the native module:
  - `Create Client` → status `created`
  - `Login` (may fail without real server; status shows error but should not crash)
  - `Is Authenticated?` → updates `isAuthValue`
  - `Get Rooms` → updates `roomsCount`

Troubleshooting

- Android missing JNI libs: ensure `HUM_RUST_REPO_ROOT` or `HUM_RUST_ANDROID_OUT` is set and `rust:build:android` was run.
- iOS Pods failure about `ffi.xcframework`: ensure the xcframework exists in `native/rust/build/ios` and that `WITH_HUM_RUST=true` `HUM_RUST_IOS_OUT=...` are set when running `expo run:ios`.
