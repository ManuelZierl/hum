# Rust Workspace

This directory hosts the project's Rust workspace. It is intentionally
isolated from the JavaScript/TypeScript codebase so Rust crates can
evolve independently.

## Layout

- `Cargo.toml` – workspace manifest listing member crates. New crates should
  live in their own folders here (siblings of `matrix_core`) and be added to the
  `members` array.
- `matrix_core/` – core library crate with placeholder code and tests.
- `build-scripts/` – helper scripts for building native artifacts, including
  `build-android.sh`, `build-ios.sh`, and a `Makefile`.
- `rust-toolchain.toml` – pins the stable Rust toolchain.
- `rustfmt.toml` – formatting configuration.
- `clippy.toml` – lints configuration; warnings are denied.

## Commands

From this directory you can run:

```sh
cargo metadata
cargo check
cargo test
```

These commands operate purely on Rust code without coupling to the JS
packages.

