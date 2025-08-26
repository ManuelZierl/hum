# Ln Core Native Module

This package hosts the future Lightning node core for the mChat app.
The native module is registered as **`LnCore`**, matching the Android
package path `com.mchat.lncore`.

## Current status

Only a minimal Expo Modules stub is provided for iOS. It exposes a
single `ping()` function that returns a static `"pong"` string. This
serves as a placeholder so other parts of the project can link against
the module while the real Lightning functionality is built.

## Planned API surface

The module will eventually expose methods for initializing the node,
creating and paying invoices, querying balances and more. These methods
will mirror the API surface used on Android so the JavaScript layer can
interact with Lightning features in a cross‑platform way.

## Integration

This package will be linked into the app via an Expo Config Plugin
(`with-ln-core`) which will configure the native build to include the
module on both Android and iOS. The config plugin will be added in a
future update.

