HumClient -> FFI Mapping

Summary: The `hum-matrix-core::HumClient` surface is exposed to C consumers via `hum-matrix-ffi` as a C ABI with opaque handles and explicit memory ownership. This table lists the current implemented coverage.

Constructors & Lifecycle

- HumClient::new(config) -> hum_client_new(hs_url, store_path, err_out)
- HumClient::from_store(path) -> hum_client_new(hs_url, store_path, err_out)
- Drop -> hum_client_free(handle)

Auth & Identity

- login(username, password) -> hum_client_login
- logout() -> hum_client_logout
- is_authenticated() -> hum_client_is_authenticated
- import_recovery_key(k) -> hum_client_import_recovery_key

Sync & State

- initial_sync/sync_once -> hum_client_sync_once
- start_sync_loop/stop_sync_loop -> hum_client_start_sync_loop / hum_client_stop_sync_loop
- Event streaming -> (pending)

Rooms & Membership

- create_room(opts) -> hum_client_create_room (name?, topic?, is_public)
- join_room(id_or_alias) -> hum_client_join_room
- leave_room(room_id) -> hum_client_leave_room
- get_rooms() -> hum_client_get_rooms (JSON array)
- get_room(room_id) -> (pending)

Messaging

- send_text -> hum_client_send_text
- send_reaction -> hum_client_send_reaction
- redact -> hum_client_redact
- send_read_receipt -> hum_client_send_read_receipt
- set_typing -> hum_client_set_typing

Media

- upload_media -> hum_client_upload_media (returns MXC uri string)
- download_media -> hum_client_download_media (returns buffer + length)

Presence

- set_presence -> hum_client_set_presence (0 Online, 1 Idle, 2 DnD, 3 Invisible)
- get_presence -> hum_client_get_presence (returns state code)

Contacts

- search_users -> hum_client_search_users (returns JSON array)

Ownership & Memory

- Strings: returned as `char*`, free with `hum_free_string`.
- Buffers: returned as `(uint8_t*, size_t)`, free with `hum_free_buf`.
- All functions return `int` status: 0 = success, non-zero = failure. On error, `err_out` receives an allocated error string.

Notes

- Header generated at: `native/rust/crates/ffi/include/hum.h`.
