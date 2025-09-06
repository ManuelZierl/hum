This directory will contain the prebuilt Rust `ffi.xcframework` and the public headers used by CocoaPods.

Expected layout:
- `ios/ffi.xcframework` – copied by the Expo config plugin
- `ios/include/hum.h` – copied from `native/rust/crates/ffi/include/hum.h`

The `HumNative.podspec` vends these artifacts to the app project.
