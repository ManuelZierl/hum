# Developer Environment Setup

This guide helps contributors configure a local environment for building and running the project on **macOS** and **Linux**.

## Prerequisites

### Node.js and pnpm
- **Node.js:** 20.x LTS
- **pnpm:** 8.x

Install via [Node Version Manager](https://github.com/nvm-sh/nvm) or your package manager:
```bash
# install Node 20
nvm install 20
# install pnpm globally
npm install -g pnpm@8
```

### Java & Android
- **JDK:** 17 (Temurin/OpenJDK)
- **Android Studio:** latest stable with Android SDK & NDK 25.2+
- Set `ANDROID_HOME` and `JAVA_HOME` environment variables.

Install `cargo-ndk` for cross-compiling Rust to Android:
```bash
cargo install cargo-ndk
```

### Xcode & iOS (macOS only)
- **Xcode:** 15 or newer with Command Line Tools
- Accept the license and install tools:
```bash
sudo xcode-select --switch /Applications/Xcode.app
sudo xcodebuild -runFirstLaunch
```

### Rust Toolchain
Install Rust via [rustup](https://rustup.rs/):
```bash
curl https://sh.rustup.rs -sSf | sh
rustup default stable
```
Add required targets:
```bash
rustup target add aarch64-linux-android x86_64-linux-android \
    aarch64-apple-darwin x86_64-apple-darwin \
    aarch64-apple-ios aarch64-apple-ios-sim
```

## Running Packages
Install dependencies and run packages with `pnpm`:
```bash
pnpm install
# run a package by name
pnpm --filter <package> start
# mobile app helpers
pnpm android   # run on Android device/emulator
pnpm ios       # run on iOS simulator
```
For Rust crates:
```bash
cargo test
cargo run -p <crate-name>
```

## Troubleshooting
### Android
- Gradle cache issues: `cd android && ./gradlew clean`
- NDK mismatch: verify `android/gradle.properties` matches installed NDK version.
- Emulator fails to start: ensure `ANDROID_HOME` points to a valid SDK.

### iOS
- CocoaPods errors: `cd ios && rm -rf Pods && pod install`
- Xcode build stuck: clean derived data (`rm -rf ~/Library/Developer/Xcode/DerivedData`)
- Simulator not launching: `xcode-select --switch /Applications/Xcode.app`

### General
- Mismatch Node or pnpm versions: reinstall using `nvm`.
- Rust crate compilation failures: run `rustup update` and ensure all targets are installed.

## Verification
The instructions above have been validated on both macOS and Linux.
