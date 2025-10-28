---

layout: default
title: Dev Client Setup
parent: Development
nav_order: 6

---

Dev Client Setup (Expo New Architecture + Matrix SDK)

This guide shows how to build and run the app with a custom Expo Dev Client that includes the third-party `react-native-matrix-sdk` module.

Prereqs

- Xcode for iOS, Android Studio for Android
- iOS: Xcode command line tools, CocoaPods

The custom Matrix SDK ships as a regular React Native native module. No Rust toolchains or manual artifact copies are required anymore.

Run with Dev Client

Android:

```
npm run -w mobile dev:android
```

iOS:

```
npm run -w mobile dev:ios
```

Environment effects:

- `DEV_FEATURES=1`: shows the Dev Native Bridge screen inside the app.

First Run Notes

- `expo run:ios|android` will generate native projects (prebuild) and install the Dev Client.
- iOS: `pod install` runs inside `apps/mobile/ios` automatically.

Verify at Runtime

- The app should launch. With `DEV_FEATURES=1`, a small pink circular button (testID `btnOpenDev`) appears in the top-right.
- Tap it to open the Dev Native Bridge screen.
- Use the buttons to call the native module:
  - `Create Client` → status `created`
  - `Login` (may fail without real server; status shows error but should not crash)
  - `Is Authenticated?` → updates `isAuthValue`
  - `Get Rooms` → updates `roomsCount`

Troubleshooting

- Matrix SDK linking errors: rerun `npm install --legacy-peer-deps` to ensure native dependencies are installed in all workspaces.
