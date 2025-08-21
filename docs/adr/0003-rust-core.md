# 0003: Implement core logic in Rust

- Status: Accepted
- Date: 2025-08-20

## Context
End-to-end encryption and protocol handling require performance and safety. Rust offers memory safety without a garbage collector and has an existing Matrix SDK.

## Decision
Develop the application's core using Rust, leveraging `matrix-rust-sdk`, and expose functionality to the React Native layer through a native module.

## Consequences
- High-performance, memory-safe core.
- Shared logic across platforms.
- Requires a bridging layer to connect Rust and JavaScript.
- Builds become more complex with native code compilation.
