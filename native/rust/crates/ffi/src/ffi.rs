use crate::impls as imp;
use crate::*;

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_free_string(s: *mut c_char) {
    imp::hum_free_string_impl(s)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_new(
    hs_url: *const c_char,
    store_path: *const c_char,
    err_out: *mut *mut c_char,
) -> *mut HumClientHandle {
    imp::hum_client_new_impl(hs_url, store_path, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_free(handle: *mut HumClientHandle) {
    imp::hum_client_free_impl(handle)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_login(
    handle: *mut HumClientHandle,
    username: *const c_char,
    password: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_login_impl(handle, username, password, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_logout(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_logout_impl(handle, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_is_authenticated(
    handle: *mut HumClientHandle,
    out_is_auth: *mut bool,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_is_authenticated_impl(handle, out_is_auth, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_sync_once(
    handle: *mut HumClientHandle,
    timeout_ms: u64,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_sync_once_impl(handle, timeout_ms, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_start_sync_loop(
    handle: *mut HumClientHandle,
    timeout_ms: u64,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_start_sync_loop_impl(handle, timeout_ms, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_stop_sync_loop(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_stop_sync_loop_impl(handle, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_send_text(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    body: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_send_text_impl(handle, room_id, body, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_create_room(
    handle: *mut HumClientHandle,
    name: *const c_char,
    topic: *const c_char,
    is_public: bool,
    out_room_id: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_create_room_impl(handle, name, topic, is_public, out_room_id, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_join_room(
    handle: *mut HumClientHandle,
    id_or_alias: *const c_char,
    out_room_id: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_join_room_impl(handle, id_or_alias, out_room_id, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_leave_room(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_leave_room_impl(handle, room_id, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_get_rooms(
    handle: *mut HumClientHandle,
    out_json: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_get_rooms_impl(handle, out_json, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_send_reaction(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    event_id: *const c_char,
    key: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_send_reaction_impl(handle, room_id, event_id, key, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_redact(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    event_id: *const c_char,
    reason: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_redact_impl(handle, room_id, event_id, reason, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_set_typing(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    is_typing: bool,
    timeout_ms: u32,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_set_typing_impl(handle, room_id, is_typing, timeout_ms, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_import_recovery_key(
    handle: *mut HumClientHandle,
    key: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_import_recovery_key_impl(handle, key, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_search_users(
    handle: *mut HumClientHandle,
    query: *const c_char,
    limit: u32,
    out_json: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_search_users_impl(handle, query, limit, out_json, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_get_devices(
    handle: *mut HumClientHandle,
    out_json: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_get_devices_impl(handle, out_json, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_rename_device(
    handle: *mut HumClientHandle,
    device_id: *const c_char,
    name: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_rename_device_impl(handle, device_id, name, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_delete_device(
    handle: *mut HumClientHandle,
    device_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_delete_device_impl(handle, device_id, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_upload_media(
    handle: *mut HumClientHandle,
    data: *const u8,
    len: usize,
    mime: *const c_char,
    out_uri: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_upload_media_impl(handle, data, len, mime, out_uri, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_download_media(
    handle: *mut HumClientHandle,
    uri: *const c_char,
    out_buf: *mut *mut u8,
    out_len: *mut usize,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_download_media_impl(handle, uri, out_buf, out_len, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_free_buf(ptr: *mut u8, _len: usize) {
    imp::hum_free_buf_impl(ptr, _len)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_send_read_receipt(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    event_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_send_read_receipt_impl(handle, room_id, event_id, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_set_presence(
    handle: *mut HumClientHandle,
    state: u32,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_set_presence_impl(handle, state, err_out)
}

#[cfg_attr(coverage_nightly, coverage(off))]
#[no_mangle]
pub unsafe extern "C" fn hum_client_get_presence(
    handle: *mut HumClientHandle,
    user_id: *const c_char,
    out_state: *mut u32,
    err_out: *mut *mut c_char,
) -> c_int {
    imp::hum_client_get_presence_impl(handle, user_id, out_state, err_out)
}
