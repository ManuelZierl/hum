#![allow(clippy::missing_safety_doc)]

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
    inner: Option<Arc<HumClient>>,
    runtime: tokio::runtime::Runtime,
}

impl HandleInner {
    fn client(&self) -> &Arc<HumClient> {
        self.inner
            .as_ref()
            .expect("HumClient already freed from handle")
    }
}

impl Drop for HandleInner {
    fn drop(&mut self) {
        if let Some(inner) = self.inner.take() {
            let _guard = self.runtime.enter();
            drop(inner);
        }
    }
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
pub unsafe extern "C" fn hum_free_string(s: *mut c_char) {
    if !s.is_null() {
        unsafe {
            let _ = CString::from_raw(s);
        }
    }
}

/// Create a new client handle.
#[no_mangle]
pub unsafe extern "C" fn hum_client_new(
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
                        inner: Some(Arc::new(inner)),
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
pub unsafe extern "C" fn hum_client_free(handle: *mut HumClientHandle) {
    if handle.is_null() {
        return;
    }
    unsafe {
        drop(Box::from_raw(handle as *mut HandleInner));
    }
}

/// Log in.
#[no_mangle]
pub unsafe extern "C" fn hum_client_login(
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
        .block_on(handle.client().login(&username, &password))
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
pub unsafe extern "C" fn hum_client_logout(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    match handle.runtime.block_on(handle.client().logout()) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Check auth state.
#[no_mangle]
pub unsafe extern "C" fn hum_client_is_authenticated(
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
    let v = handle.client().is_authenticated();
    unsafe {
        *out_is_auth = v;
    }
    0
}

/// Run one sync with timeout.
#[no_mangle]
pub unsafe extern "C" fn hum_client_sync_once(
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
    match handle.runtime.block_on(handle.client().sync_once(&cfg)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Start continuous sync.
#[no_mangle]
pub unsafe extern "C" fn hum_client_start_sync_loop(
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
    match handle
        .runtime
        .block_on(handle.client().start_sync_loop(&cfg))
    {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Stop continuous sync.
#[no_mangle]
pub unsafe extern "C" fn hum_client_stop_sync_loop(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = unsafe { &*(handle as *mut HandleInner) };
    match handle.runtime.block_on(handle.client().stop_sync_loop()) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Send text.
#[no_mangle]
pub unsafe extern "C" fn hum_client_send_text(
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
        .block_on(handle.client().send_text(&room_id, &body))
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
pub unsafe extern "C" fn hum_client_create_room(
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
    match handle.runtime.block_on(handle.client().create_room(opts)) {
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
pub unsafe extern "C" fn hum_client_join_room(
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
    match handle.runtime.block_on(handle.client().join_room(&s)) {
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
pub unsafe extern "C" fn hum_client_leave_room(
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
    match handle.runtime.block_on(handle.client().leave_room(&rid)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Get joined rooms as JSON array of { room_id, name }.
#[no_mangle]
pub unsafe extern "C" fn hum_client_get_rooms(
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
    let rooms = handle.client().get_rooms();
    let s = serde_json::to_string(&rooms).unwrap_or("[]".to_string());
    let c = CString::new(s).unwrap();
    unsafe {
        *out_json = c.into_raw();
    }
    0
}

/// Send reaction.
#[no_mangle]
pub unsafe extern "C" fn hum_client_send_reaction(
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
        .block_on(handle.client().send_reaction(&rid, &eid, &key))
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
pub unsafe extern "C" fn hum_client_redact(
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
        .block_on(handle.client().redact(&rid, &eid, reason_opt.as_deref()))
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
pub unsafe extern "C" fn hum_client_set_typing(
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
    match handle.runtime.block_on(handle.client().set_typing(
        &rid,
        is_typing,
        Some(timeout_ms as u64),
    )) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Import recovery key (bootstrap secret storage).
#[no_mangle]
pub unsafe extern "C" fn hum_client_import_recovery_key(
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
        .block_on(handle.client().import_recovery_key(&key))
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
pub unsafe extern "C" fn hum_client_search_users(
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
        .block_on(handle.client().search_users(&query, Some(limit)))
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
pub unsafe extern "C" fn hum_client_get_devices(
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
    match handle.runtime.block_on(handle.client().get_devices()) {
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
pub unsafe extern "C" fn hum_client_rename_device(
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
        .block_on(handle.client().rename_device(&dev, &name))
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
pub unsafe extern "C" fn hum_client_delete_device(
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
    match handle.runtime.block_on(handle.client().delete_device(&dev)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Upload media. `data` is not owned and will not be freed by this function.
#[no_mangle]
pub unsafe extern "C" fn hum_client_upload_media(
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
        .block_on(handle.client().upload_media(slice, &mime))
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
pub unsafe extern "C" fn hum_client_download_media(
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
    match handle
        .runtime
        .block_on(handle.client().download_media(&uri))
    {
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
pub unsafe extern "C" fn hum_free_buf(ptr: *mut u8, _len: usize) {
    if ptr.is_null() {
        return;
    }
    unsafe { libc::free(ptr as *mut libc::c_void) }
}

/// Send read receipt.
#[no_mangle]
pub unsafe extern "C" fn hum_client_send_read_receipt(
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
        .block_on(handle.client().send_read_receipt(&rid, &eid))
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
pub unsafe extern "C" fn hum_client_set_presence(
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
    match handle.runtime.block_on(handle.client().set_presence(st)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

/// Get presence for a user id; writes presence code as in `hum_client_set_presence`.
#[no_mangle]
pub unsafe extern "C" fn hum_client_get_presence(
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
            .client()
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
    use httpmock::prelude::*;
    use serde_json::json;
    use std::ffi::{CStr, CString};
    use std::ptr;
    use tempfile::tempdir;

    fn take_error(err: &mut *mut c_char) -> Option<String> {
        let ptr = *err;
        if ptr.is_null() {
            return None;
        }
        unsafe {
            let c = CString::from_raw(ptr);
            *err = ptr::null_mut();
            Some(c.to_string_lossy().into_owned())
        }
    }

    fn assert_no_error(err: &mut *mut c_char) {
        if let Some(msg) = take_error(err) {
            panic!("unexpected error: {msg}");
        }
    }

    #[test]
    fn free_string_is_safe_with_null_and_owned_pointer() {
        unsafe {
            hum_free_string(ptr::null_mut());
        }
        let owned = CString::new("hello").unwrap();
        let ptr = owned.into_raw();
        unsafe {
            hum_free_string(ptr);
        }
    }

    #[test]
    fn client_lifecycle_success_flow() {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let _login = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEVICE",
                "user_id": "@user:example.org"
            }));
        });
        let _logout = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/logout");
            then.status(200).json_body(json!({}));
        });
        let room_id = "!r:example.org";
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {
                    "join": {
                        room_id: {
                            "summary": {},
                            "state": { "events": [] },
                            "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                            "ephemeral": { "events": [] },
                            "account_data": { "events": [] },
                            "unread_notifications": {}
                        }
                    }
                }
            }));
        });
        let _encrypt_state = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/rooms/!r:example.org/state/m.room.encryption");
            then.status(404);
        });
        let _send = server.mock(|when, then| {
            when.method(PUT)
                .path_contains("/_matrix/client/v3/rooms/!r:example.org/send/m.room.message/");
            then.status(200)
                .json_body(json!({ "event_id": "$event:example.org" }));
        });
        let _create_room = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/createRoom");
            then.status(200)
                .json_body(json!({ "room_id": "!new:example.org" }));
        });

        let dir = tempdir().unwrap();
        let homeserver = CString::new(server.base_url()).unwrap();
        let store_path = CString::new(dir.path().to_string_lossy().into_owned()).unwrap();
        let mut err: *mut c_char = ptr::null_mut();
        let handle = unsafe { hum_client_new(homeserver.as_ptr(), store_path.as_ptr(), &mut err) };
        assert!(!handle.is_null());
        assert_no_error(&mut err);

        let mut is_auth = true;
        let code = unsafe { hum_client_is_authenticated(handle, &mut is_auth, &mut err) };
        assert_eq!(code, 0);
        assert!(!is_auth);
        assert_no_error(&mut err);

        let username = CString::new("user").unwrap();
        let password = CString::new("pass").unwrap();
        let code =
            unsafe { hum_client_login(handle, username.as_ptr(), password.as_ptr(), &mut err) };
        assert_eq!(code, 0);
        assert_no_error(&mut err);

        let mut is_auth = false;
        let code = unsafe { hum_client_is_authenticated(handle, &mut is_auth, &mut err) };
        assert_eq!(code, 0);
        assert!(is_auth);
        assert_no_error(&mut err);

        let code = unsafe { hum_client_sync_once(handle, 0, &mut err) };
        assert_eq!(code, 0);
        assert_no_error(&mut err);

        let code = unsafe { hum_client_start_sync_loop(handle, 0, &mut err) };
        if code == 0 {
            assert_no_error(&mut err);
        } else {
            assert_eq!(code, 2);
            assert!(take_error(&mut err).is_some());
        }

        let code = unsafe { hum_client_stop_sync_loop(handle, &mut err) };
        if code == 0 {
            assert_no_error(&mut err);
        } else {
            assert_eq!(code, 2);
            assert!(take_error(&mut err).is_some());
        }

        let room = CString::new("!r:example.org").unwrap();
        let body = CString::new("hi").unwrap();
        let code = unsafe { hum_client_send_text(handle, room.as_ptr(), body.as_ptr(), &mut err) };
        if code == 0 {
            assert_no_error(&mut err);
        } else {
            assert_eq!(code, 2);
            assert!(take_error(&mut err).is_some());
        }

        let name = CString::new("Room name").unwrap();
        let mut out_room_id: *mut c_char = ptr::null_mut();
        let code = unsafe {
            hum_client_create_room(
                handle,
                name.as_ptr(),
                ptr::null(),
                true,
                &mut out_room_id,
                &mut err,
            )
        };
        assert_eq!(code, 0);
        assert!(!out_room_id.is_null());
        assert_no_error(&mut err);
        let created_room = unsafe { CStr::from_ptr(out_room_id) }
            .to_string_lossy()
            .into_owned();
        assert_eq!(created_room, "!new:example.org");
        unsafe { hum_free_string(out_room_id) };

        let logout_code = unsafe { hum_client_logout(handle, &mut err) };
        if logout_code == 0 {
            assert_no_error(&mut err);
        } else {
            assert_eq!(logout_code, 2);
            assert!(take_error(&mut err).is_some());
        }

        let mut is_auth = true;
        let code = unsafe { hum_client_is_authenticated(handle, &mut is_auth, &mut err) };
        assert_eq!(code, 0);
        assert_no_error(&mut err);

        unsafe { hum_client_free(handle) };
    }

    #[test]
    fn error_handling_for_null_inputs() {
        let mut err: *mut c_char = ptr::null_mut();
        let username = CString::new("user").unwrap();
        let password = CString::new("pass").unwrap();

        let code = unsafe {
            hum_client_login(
                ptr::null_mut(),
                username.as_ptr(),
                password.as_ptr(),
                &mut err,
            )
        };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

        let code = unsafe { hum_client_logout(ptr::null_mut(), &mut err) };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

        let mut is_auth = false;
        let code = unsafe { hum_client_is_authenticated(ptr::null_mut(), &mut is_auth, &mut err) };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

        let code = unsafe { hum_client_sync_once(ptr::null_mut(), 0, &mut err) };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

        let code = unsafe { hum_client_start_sync_loop(ptr::null_mut(), 0, &mut err) };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

        let code = unsafe { hum_client_stop_sync_loop(ptr::null_mut(), &mut err) };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

        let body = CString::new("hi").unwrap();
        let code =
            unsafe { hum_client_send_text(ptr::null_mut(), ptr::null(), body.as_ptr(), &mut err) };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

        let mut out_room_id: *mut c_char = ptr::null_mut();
        let code = unsafe {
            hum_client_create_room(
                ptr::null_mut(),
                ptr::null(),
                ptr::null(),
                false,
                &mut out_room_id,
                &mut err,
            )
        };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));
    }

    #[test]
    fn null_out_param_is_rejected() {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let dir = tempdir().unwrap();
        let homeserver = CString::new(server.base_url()).unwrap();
        let store_path = CString::new(dir.path().to_string_lossy().into_owned()).unwrap();
        let mut err: *mut c_char = ptr::null_mut();
        let handle = unsafe { hum_client_new(homeserver.as_ptr(), store_path.as_ptr(), &mut err) };
        assert!(!handle.is_null());
        assert_no_error(&mut err);

        let code = unsafe { hum_client_is_authenticated(handle, ptr::null_mut(), &mut err) };
        assert_eq!(code, 1);
        assert_eq!(take_error(&mut err).as_deref(), Some("null out param"));

        unsafe { hum_client_free(handle) };
    }
}
