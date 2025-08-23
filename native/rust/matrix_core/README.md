# matrix_core

`matrix_core` defines a minimal boundary for Matrix-based applications.
It exposes configuration, session and event types alongside an abstract
storage trait so that higher level crates can share a stable contract.
No networking code or Matrix SDK is included; those responsibilities live
in other layers.

## Features

- `ClientConfig` and `Session` structures.
- `MatrixEvent` enums for messages, receipts, typing notifications and
  room metadata.
- `IMatrixStore` trait with async APIs.
- In-memory (`mem-store` feature) and SQLite (`sqlite` feature, default)
  storage adapters.
- `CoreError` and `CoreResult` for unified error handling.

## Non-goals

This crate does **not** implement Matrix protocol interactions or
federation. It simply provides stable types and storage abstractions
that other crates can build upon.
