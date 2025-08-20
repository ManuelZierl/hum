# Rust Workspace

This directory bootstraps the Rust core for the project. It defines a Cargo workspace
that will later expose Matrix and other functionality over FFI.

- Uses the stable Rust toolchain.
- Currently contains a single crate, `matrix_core`, with placeholder code and tests.
- `cargo check` verifies the workspace builds.
- `cargo test` runs the unit tests.

This workspace is self-contained and ready for further expansion.
