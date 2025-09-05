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

## Real CLI smoke test

The `hum-cli` example can perform a basic login and sync against a Matrix
homeserver. Set the following environment variables and run the example:

```bash
MATRIX_USER='@alice:matrix.org' MATRIX_PASS='***' cargo run -p hum-cli
MATRIX_USER='@alice:matrix.org' MATRIX_PASS='***' MATRIX_ROOM='!roomid:matrix.org' cargo run -p hum-cli
```

Optional variables:

- `MATRIX_HS` – homeserver URL (defaults to `https://matrix.org`)
- `MATRIX_STORE` – path for the SQLite store (defaults to `hum_store`)
- `MATRIX_ROOM` – unencrypted room ID to send a test message

On success the CLI logs in, starts syncing, and prints a status line. Use
`Ctrl-C` to exit.
