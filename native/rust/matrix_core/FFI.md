# FFI Plan

This document defines the boundary between the `matrix_core` Rust crate and the mobile
layer (React Native/Expo). It records conventions before more code is added.

## Entry point and mapping

- `src/lib.rs` exposes all functions that cross the Rust ↔ mobile boundary.
- These functions will be wrapped by a single Expo Module, keeping a 1:1 mapping
  between exported Rust symbols and JavaScript methods.
- Rust functions are declared with `#[no_mangle]` and use a `matrix_core_` prefix to
  avoid symbol collisions.

## Error handling

- FFI functions return `MatrixResult<T>` which is an alias for `Result<T, MatrixError>`.
- `MatrixError` carries a stable integer code and optional UTF-8 message.
- Mobile callers translate the code to the appropriate platform error/exception.

## Threading model

- FFI calls are synchronous but must not block the UI thread.
- Long running work is spawned on a dedicated Rust runtime; the JS layer awaits the
  result using Promises.

## Type mapping decisions

- UTF-8 strings are exchanged as `*const c_char` / `CString`.
- Binary data is passed as raw byte slices and mapped to `Uint8Array` on the JS side.
- Structured data uses JSON strings for now. If performance becomes an issue,
  dedicated structs with explicit layout will replace the JSON layer.

## Naming conventions

- Exposed functions follow `matrix_core_<verb>_<noun>` naming (e.g.,
  `matrix_core_sum`).
- The corresponding JavaScript method drops the `matrix_core_` prefix and is
  converted to camelCase (e.g., `sum`).

These conventions make the FFI boundary explicit and provide a clear path to the
future Expo Module API.
