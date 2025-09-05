//! C ABI for Hum client. Functions return 0 on success; non-zero on error.

use std::{
    ffi::{CStr, CString},
    os::raw::{c_char, c_int},
    path::PathBuf,
    ptr,
    sync::Arc,
};

use hum_matrix_core::rooms::CreateRoomOptions;
use hum_matrix_core::{
    client::HumClient,
    config::{ClientConfig, SyncConfig},
};

/// Opaque handle exposed to C.
#[repr(C)]
pub struct HumClientHandle {
    _private: [u8; 0],
}

struct HandleInner {
    inner: Arc<HumClient>,
    runtime: tokio::runtime::Runtime,
}

fn set_error(err_out: *mut *mut c_char, msg: String) {
    if err_out.is_null() {
        return;
    }
    let c = CString::new(msg).unwrap_or_else(|_| CString::new("invalid error").unwrap());
    unsafe {
        *err_out = c.into_raw();
    }
}

/// Free a C string allocated by this library.
#[no_mangle]
pub extern "C" fn hum_free_string(s: *mut c_char) {
    if !s.is_null() {
        unsafe {
            let _ = CString::from_raw(s);
        }
    }
}

/// Create a new client handle.
#[no_mangle]
pub extern "C" fn hum_client_new(
    hs_url: *const c_char,
    store_path: *const c_char,
    err_out: *mut *mut c_char,
) -> *mut HumClientHandle {
    let hs_url = unsafe { CStr::from_ptr(hs_url) }
        .to_string_lossy()
        .to_string();
    let store = unsafe { CStr::from_ptr(store_path) }
        .to_string_lossy()
        .to_string();
    match tokio::runtime::Runtime::new() {
        Ok(runtime) => {
            let cfg = ClientConfig::new(hs_url, PathBuf::from(store));
            match runtime.block_on(HumClient::new(cfg)) {
                Ok(inner) => {
                    let handle = HandleInner {
                        inner: Arc::new(inner),
                        runtime,
                    };
                    Box::into_raw(Box::new(handle)) as *mut HumClientHandle
                }
                Err(e) => {
                    set_error(err_out, e.to_string());
                    ptr::null_mut()
                }
            }
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            ptr::null_mut()
        }
    }
}

/// Free a client handle.
#[no_mangle]
pub extern "C" fn hum_client_free(handle: *mut HumClientHandle) {
    if handle.is_null() {
        return;
    }
    unsafe {
        drop(Box::from_raw(handle as *mut HandleInner));
    }
}

/// Log in.
#[no_mangle]
pub extern "C" fn hum_client_login(
    handle: *mut HumClientHandle,
    username: *const c_char,
    password: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let username = unsafe { CStr::from_ptr(username) }
        .to_string_lossy()
        .to_string();
    let password = unsafe { CStr::from_ptr(password) }
        .to_string_lossy()
        .to_string();
    match handle
        .runtime
        .block_on(handle.inner.login(&username, &password))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Logout.
#[no_mangle]
pub extern "C" fn hum_client_logout(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    match handle.runtime.block_on(handle.inner.logout()) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Check auth state.
#[no_mangle]
pub extern "C" fn hum_client_is_authenticated(
    handle: *mut HumClientHandle,
    out_is_auth: *mut bool,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_is_auth.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let v = handle.inner.is_authenticated();
    unsafe {
        *out_is_auth = v;
    }
    0
}

/// Run one sync with timeout.
#[no_mangle]
pub extern "C" fn hum_client_sync_once(
    handle: *mut HumClientHandle,
    timeout_ms: u64,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let cfg = SyncConfig::new(false, Some(timeout_ms));
    match handle.runtime.block_on(handle.inner.sync_once(&cfg)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Start continuous sync.
#[no_mangle]
pub extern "C" fn hum_client_start_sync_loop(
    handle: *mut HumClientHandle,
    timeout_ms: u64,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let cfg = SyncConfig::new(false, Some(timeout_ms));
    match handle.runtime.block_on(handle.inner.start_sync_loop(&cfg)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Stop continuous sync.
#[no_mangle]
pub extern "C" fn hum_client_stop_sync_loop(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    match handle.runtime.block_on(handle.inner.stop_sync_loop()) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Send text.
#[no_mangle]
pub extern "C" fn hum_client_send_text(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    body: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let room_id = unsafe { CStr::from_ptr(room_id) }
        .to_string_lossy()
        .to_string();
    let body = unsafe { CStr::from_ptr(body) }
        .to_string_lossy()
        .to_string();
    match handle
        .runtime
        .block_on(handle.inner.send_text(&room_id, &body))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Create a room; returns room_id.
#[no_mangle]
pub extern "C" fn hum_client_create_room(
    handle: *mut HumClientHandle,
    name: *const c_char,
    topic: *const c_char,
    is_public: bool,
    out_room_id: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_room_id.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let name_opt = if name.is_null() {
        None
    } else {
        Some(
            unsafe { CStr::from_ptr(name) }
                .to_string_lossy()
                .to_string(),
        )
    };
    let topic_opt = if topic.is_null() {
        None
    } else {
        Some(
            unsafe { CStr::from_ptr(topic) }
                .to_string_lossy()
                .to_string(),
        )
    };
    let opts = CreateRoomOptions {
        name: name_opt,
        topic: topic_opt,
        is_public,
    };
    match handle.runtime.block_on(handle.inner.create_room(opts)) {
        Ok(info) => {
            let c = CString::new(info.room_id.to_string()).unwrap();
            unsafe {
                *out_room_id = c.into_raw();
            }
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Join a room by id or alias; returns room_id.
#[no_mangle]
pub extern "C" fn hum_client_join_room(
    handle: *mut HumClientHandle,
    id_or_alias: *const c_char,
    out_room_id: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_room_id.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let s = unsafe { CStr::from_ptr(id_or_alias) }
        .to_string_lossy()
        .to_string();
    match handle.runtime.block_on(handle.inner.join_room(&s)) {
        Ok(info) => {
            let c = CString::new(info.room_id.to_string()).unwrap();
            unsafe {
                *out_room_id = c.into_raw();
            }
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Leave a room.
#[no_mangle]
pub extern "C" fn hum_client_leave_room(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let rid = unsafe { CStr::from_ptr(room_id) }
        .to_string_lossy()
        .to_string();
    match handle.runtime.block_on(handle.inner.leave_room(&rid)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Get joined rooms as JSON array of { room_id, name }.
#[no_mangle]
pub extern "C" fn hum_client_get_rooms(
    handle: *mut HumClientHandle,
    out_json: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_json.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let rooms = handle.inner.get_rooms();
    let s = serde_json::to_string(&rooms).unwrap_or("[]".to_string());
    let c = CString::new(s).unwrap();
    unsafe {
        *out_json = c.into_raw();
    }
    0
}

/// Send reaction.
#[no_mangle]
pub extern "C" fn hum_client_send_reaction(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    event_id: *const c_char,
    key: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let rid = unsafe { CStr::from_ptr(room_id) }
        .to_string_lossy()
        .to_string();
    let eid = unsafe { CStr::from_ptr(event_id) }
        .to_string_lossy()
        .to_string();
    let key = unsafe { CStr::from_ptr(key) }.to_string_lossy().to_string();
    match handle
        .runtime
        .block_on(handle.inner.send_reaction(&rid, &eid, &key))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Redact event.
#[no_mangle]
pub extern "C" fn hum_client_redact(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    event_id: *const c_char,
    reason: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let rid = unsafe { CStr::from_ptr(room_id) }
        .to_string_lossy()
        .to_string();
    let eid = unsafe { CStr::from_ptr(event_id) }
        .to_string_lossy()
        .to_string();
    let reason_opt = if reason.is_null() {
        None
    } else {
        Some(
            unsafe { CStr::from_ptr(reason) }
                .to_string_lossy()
                .to_string(),
        )
    };
    match handle
        .runtime
        .block_on(handle.inner.redact(&rid, &eid, reason_opt.as_deref()))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Set typing state.
#[no_mangle]
pub extern "C" fn hum_client_set_typing(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    is_typing: bool,
    timeout_ms: u32,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let rid = unsafe { CStr::from_ptr(room_id) }
        .to_string_lossy()
        .to_string();
    match handle.runtime.block_on(
        handle
            .inner
            .set_typing(&rid, is_typing, Some(timeout_ms as u64)),
    ) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Import recovery key (bootstrap secret storage).
#[no_mangle]
pub extern "C" fn hum_client_import_recovery_key(
    handle: *mut HumClientHandle,
    key: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let key = unsafe { CStr::from_ptr(key) }.to_string_lossy().to_string();
    match handle
        .runtime
        .block_on(handle.inner.import_recovery_key(&key))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Search users; returns a JSON string array of { user_id, display_name }.
#[no_mangle]
pub extern "C" fn hum_client_search_users(
    handle: *mut HumClientHandle,
    query: *const c_char,
    limit: u32,
    out_json: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_json.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let query = unsafe { CStr::from_ptr(query) }
        .to_string_lossy()
        .to_string();
    match handle
        .runtime
        .block_on(handle.inner.search_users(&query, Some(limit)))
    {
        Ok(vec) => {
            let s = serde_json::to_string(&vec).unwrap_or("[]".to_string());
            let c = CString::new(s).unwrap();
            unsafe {
                *out_json = c.into_raw();
            }
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Get devices; returns a JSON string array of { device_id, display_name }.
#[no_mangle]
pub extern "C" fn hum_client_get_devices(
    handle: *mut HumClientHandle,
    out_json: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_json.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    match handle.runtime.block_on(handle.inner.get_devices()) {
        Ok(vec) => {
            let s = serde_json::to_string(&vec).unwrap_or("[]".to_string());
            let c = CString::new(s).unwrap();
            unsafe {
                *out_json = c.into_raw();
            }
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Rename a device.
#[no_mangle]
pub extern "C" fn hum_client_rename_device(
    handle: *mut HumClientHandle,
    device_id: *const c_char,
    name: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let dev = unsafe { CStr::from_ptr(device_id) }
        .to_string_lossy()
        .to_string();
    let name = unsafe { CStr::from_ptr(name) }
        .to_string_lossy()
        .to_string();
    match handle
        .runtime
        .block_on(handle.inner.rename_device(&dev, &name))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Delete a device.
#[no_mangle]
pub extern "C" fn hum_client_delete_device(
    handle: *mut HumClientHandle,
    device_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let dev = unsafe { CStr::from_ptr(device_id) }
        .to_string_lossy()
        .to_string();
    match handle.runtime.block_on(handle.inner.delete_device(&dev)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Upload media. `data` is not owned and will not be freed by this function.
#[no_mangle]
pub extern "C" fn hum_client_upload_media(
    handle: *mut HumClientHandle,
    data: *const u8,
    len: usize,
    mime: *const c_char,
    out_uri: *mut *mut c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_uri.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    if data.is_null() {
        set_error(err_out, "null data".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let mime = unsafe { CStr::from_ptr(mime) }
        .to_string_lossy()
        .to_string();
    let slice = unsafe { std::slice::from_raw_parts(data, len) };
    match handle
        .runtime
        .block_on(handle.inner.upload_media(slice, &mime))
    {
        Ok(uri) => {
            let c = CString::new(uri).unwrap();
            unsafe {
                *out_uri = c.into_raw();
            }
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Download media into an allocated buffer; caller must free via `hum_free_buf`.
#[no_mangle]
pub extern "C" fn hum_client_download_media(
    handle: *mut HumClientHandle,
    uri: *const c_char,
    out_buf: *mut *mut u8,
    out_len: *mut usize,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_buf.is_null() || out_len.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let uri = unsafe { CStr::from_ptr(uri) }.to_string_lossy().to_string();
    match handle.runtime.block_on(handle.inner.download_media(&uri)) {
        Ok(data) => {
            let len = data.len();
            unsafe {
                let ptr = libc::malloc(len);
                if ptr.is_null() {
                    set_error(err_out, "alloc failed".into());
                    return 3;
                }
                std::ptr::copy_nonoverlapping(data.as_ptr(), ptr as *mut u8, len);
                *out_buf = ptr as *mut u8;
                *out_len = len;
            }
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Free a buffer allocated by this library.
#[no_mangle]
pub extern "C" fn hum_free_buf(ptr: *mut u8, _len: usize) {
    if ptr.is_null() {
        return;
    }
    unsafe { libc::free(ptr as *mut libc::c_void) }
}

/// Send read receipt.
#[no_mangle]
pub extern "C" fn hum_client_send_read_receipt(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    event_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let rid = unsafe { CStr::from_ptr(room_id) }
        .to_string_lossy()
        .to_string();
    let eid = unsafe { CStr::from_ptr(event_id) }
        .to_string_lossy()
        .to_string();
    match handle
        .runtime
        .block_on(handle.inner.send_read_receipt(&rid, &eid))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Set presence: 0 Online, 1 Idle, 2 DoNotDisturb, 3 Invisible
#[no_mangle]
pub extern "C" fn hum_client_set_presence(
    handle: *mut HumClientHandle,
    state: u32,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let st = match state {
        0 => hum_matrix_core::presence::PresenceState::Online,
        1 => hum_matrix_core::presence::PresenceState::Idle,
        2 => hum_matrix_core::presence::PresenceState::DoNotDisturb,
        _ => hum_matrix_core::presence::PresenceState::Invisible,
    };
    match handle.runtime.block_on(handle.inner.set_presence(st)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Get presence for a user id; writes presence code as in `hum_client_set_presence`.
#[no_mangle]
pub extern "C" fn hum_client_get_presence(
    handle: *mut HumClientHandle,
    user_id: *const c_char,
    out_state: *mut u32,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    if out_state.is_null() {
        set_error(err_out, "null out param".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    let uid = unsafe { CStr::from_ptr(user_id) }
        .to_string_lossy()
        .to_string();
    match handle.runtime.block_on(async {
        handle
            .inner
            .get_presence(&uid)
            .await
            .map_err(|e| e.to_string())
    }) {
        Ok(p) => {
            let code = match p {
                hum_matrix_core::presence::PresenceState::Online => 0,
                hum_matrix_core::presence::PresenceState::Idle => 1,
                hum_matrix_core::presence::PresenceState::DoNotDisturb => 2,
                hum_matrix_core::presence::PresenceState::Invisible => 3,
            };
            unsafe {
                *out_state = code;
            }
            0
        }
        Err(e) => {
            set_error(err_out, e);
            2
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn c_api_minimal_error_path() {
        // Null handle should produce error and message
        let mut err: *mut c_char = std::ptr::null_mut();
        let user = CString::new("user").unwrap();
        let pass = CString::new("pass").unwrap();
        let rc =
            super::hum_client_login(std::ptr::null_mut(), user.as_ptr(), pass.as_ptr(), &mut err);
        assert_ne!(rc, 0);
        assert!(!err.is_null());
        super::hum_free_string(err);
    }
}
