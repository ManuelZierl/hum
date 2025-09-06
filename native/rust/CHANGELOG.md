Changelog

Unreleased

- Core: Introduced expanded `HumClient` façade in `hum-matrix-core` with:
  - Auth: `login`, `logout`, `is_authenticated`, recovery helpers (`import_recovery_key`, `verify_recovery_ready`).
  - Sync: `initial_sync`, `sync_once(SyncConfig)`, background loop start/stop.
  - Rooms: `create_room`, `join_room`, `leave_room`, `get_rooms`, `get_room` (initial pass).
  - Messaging: `send_text`, `send_reaction`, `redact`, `set_typing` (receipt pending).
  - Stubs: presence, media, contacts, devices, push — return clear not-implemented errors for now.
  - Config: Added `SyncConfig` and exported `HumClientConfig` alias.
- Tests: Added unit tests for new modules and preserved existing httpmock-driven smoke tests. All pass locally.
- FFI: Removed UniFFI; added C ABI in `hum-matrix-ffi` and generated header `crates/ffi/include/hum.h`.
  - Opaque `HumClientHandle*` with `hum_client_new/free`.
  - Synchronous wrappers: login/logout, is_authenticated, sync_once, start/stop sync loop, send_text.
  - Memory helpers: `hum_free_string`.
- Docs: Added `FFI_MAPPING.md` mapping core APIs to exported C symbols.

Breaking Changes

- None for Rust callers; existing module exports remain. UniFFI scaffolding still present for transitional use.
