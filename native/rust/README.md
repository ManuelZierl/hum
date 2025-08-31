# Hum Rust Workspace

Hum is a privacy-respecting messenger built on the [Matrix](https://matrix.org) network. This workspace contains the Rust crates that power core logic and bindings for mobile platforms.

## Quickstart

```sh
# Show workspace information
cargo metadata --format-version 1

# Format and lint
cargo fmt --all
cargo clippy

# Build and test
cargo build
cargo test
```

## Project layout

```
native/rust
├── Cargo.toml
├── clippy.toml
├── rustfmt.toml
├── rust-toolchain.toml
├── .cargo/
├── crates/
│   ├── core/
│   └── ffi/
├── examples/
│   └── cli/
├── fixtures/
├── scripts/
└── tests/
```

Each crate and example is minimal and intended as scaffolding for future development.
