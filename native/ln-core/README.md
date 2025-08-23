# Ln Core Expo Module (Mock)

This directory contains a mock implementation of a Lightning node core for use in Expo/React Native apps.
It exposes a stable TypeScript API and deterministic native shims so the module can be called from JavaScript
without connecting to real Lightning nodes or handling funds.

## Features

- `init` / `isReady` lifecycle helpers
- fixed `nodeInfo`
- mock invoice creation returning a dummy BOLT11 string
- mock payment that resolves after a short delay and emits `PaymentUpdated` events
- in-memory payment list and fee estimation helpers

**NO REAL FUNDS:** this mock does not open channels or broadcast payments. It should never be used
in production as-is. Replace the native shims with a Breez SDK or LDK backed implementation for real
Lightning support.

## Replacing the Mock

To swap in a real implementation:

1. Add native dependencies for your chosen Lightning library (Breez SDK, LDK, etc.)
2. Extend the Swift/Kotlin shims in `ios/` and `android/` to call into that library
3. Implement secure storage of node keys and channel state in the `init` options
4. Update the Expo config plugin `with-ln-core.ts` with any required native build steps or binaries

