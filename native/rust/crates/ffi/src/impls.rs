use crate::*;
use libc;

#[inline(never)]
pub(crate) unsafe fn hum_free_string_impl(s: *mut c_char) {
    if !s.is_null() {
        let _ = CString::from_raw(s);
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_new_impl(
    hs_url: *const c_char,
    store_path: *const c_char,
    err_out: *mut *mut c_char,
) -> *mut HumClientHandle {
    let hs_url = CStr::from_ptr(hs_url).to_string_lossy().to_string();
    let store = CStr::from_ptr(store_path).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_free_impl(handle: *mut HumClientHandle) {
    if handle.is_null() {
        return;
    }
    drop(Box::from_raw(handle as *mut HandleInner));
}

#[inline(never)]
pub(crate) unsafe fn hum_client_login_impl(
    handle: *mut HumClientHandle,
    username: *const c_char,
    password: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let username = CStr::from_ptr(username).to_string_lossy().to_string();
    let password = CStr::from_ptr(password).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_logout_impl(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    match handle.runtime.block_on(handle.client().logout()) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_is_authenticated_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let v = handle.client().is_authenticated();
    *out_is_auth = v;
    0
}

#[inline(never)]
pub(crate) unsafe fn hum_client_sync_once_impl(
    handle: *mut HumClientHandle,
    timeout_ms: u64,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let cfg = SyncConfig::new(false, Some(timeout_ms));
    match handle.runtime.block_on(handle.client().sync_once(&cfg)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_start_sync_loop_impl(
    handle: *mut HumClientHandle,
    timeout_ms: u64,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
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

#[inline(never)]
pub(crate) unsafe fn hum_client_stop_sync_loop_impl(
    handle: *mut HumClientHandle,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    match handle.runtime.block_on(handle.client().stop_sync_loop()) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_send_text_impl(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    body: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let room_id = CStr::from_ptr(room_id).to_string_lossy().to_string();
    let body = CStr::from_ptr(body).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_create_room_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let name_opt = if name.is_null() {
        None
    } else {
        Some(CStr::from_ptr(name).to_string_lossy().to_string())
    };
    let topic_opt = if topic.is_null() {
        None
    } else {
        Some(CStr::from_ptr(topic).to_string_lossy().to_string())
    };
    let opts = CreateRoomOptions {
        name: name_opt,
        topic: topic_opt,
        is_public,
    };
    match handle.runtime.block_on(handle.client().create_room(opts)) {
        Ok(info) => {
            let c = CString::new(info.room_id.to_string()).unwrap();
            *out_room_id = c.into_raw();
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_join_room_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let s = CStr::from_ptr(id_or_alias).to_string_lossy().to_string();
    match handle.runtime.block_on(handle.client().join_room(&s)) {
        Ok(info) => {
            let c = CString::new(info.room_id.to_string()).unwrap();
            *out_room_id = c.into_raw();
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_leave_room_impl(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let rid = CStr::from_ptr(room_id).to_string_lossy().to_string();
    match handle.runtime.block_on(handle.client().leave_room(&rid)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_get_rooms_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let rooms = handle.client().get_rooms();
    let s = serde_json::to_string(&rooms).unwrap_or("[]".to_string());
    let c = CString::new(s).unwrap();
    *out_json = c.into_raw();
    0
}

#[inline(never)]
pub(crate) unsafe fn hum_client_send_reaction_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let rid = CStr::from_ptr(room_id).to_string_lossy().to_string();
    let eid = CStr::from_ptr(event_id).to_string_lossy().to_string();
    let key = CStr::from_ptr(key).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_redact_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let rid = CStr::from_ptr(room_id).to_string_lossy().to_string();
    let eid = CStr::from_ptr(event_id).to_string_lossy().to_string();
    let reason_opt = if reason.is_null() {
        None
    } else {
        Some(CStr::from_ptr(reason).to_string_lossy().to_string())
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

#[inline(never)]
pub(crate) unsafe fn hum_client_set_typing_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let rid = CStr::from_ptr(room_id).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_import_recovery_key_impl(
    handle: *mut HumClientHandle,
    key: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let key = CStr::from_ptr(key).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_search_users_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let query = CStr::from_ptr(query).to_string_lossy().to_string();
    match handle
        .runtime
        .block_on(handle.client().search_users(&query, Some(limit)))
    {
        Ok(vec) => {
            let s = serde_json::to_string(&vec).unwrap_or("[]".to_string());
            let c = CString::new(s).unwrap();
            *out_json = c.into_raw();
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_get_devices_impl(
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
    let handle = &*(handle as *mut HandleInner);
    match handle.runtime.block_on(handle.client().get_devices()) {
        Ok(vec) => {
            let s = serde_json::to_string(&vec).unwrap_or("[]".to_string());
            let c = CString::new(s).unwrap();
            *out_json = c.into_raw();
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_rename_device_impl(
    handle: *mut HumClientHandle,
    device_id: *const c_char,
    name: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let dev = CStr::from_ptr(device_id).to_string_lossy().to_string();
    let name = CStr::from_ptr(name).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_delete_device_impl(
    handle: *mut HumClientHandle,
    device_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let dev = CStr::from_ptr(device_id).to_string_lossy().to_string();
    match handle.runtime.block_on(handle.client().delete_device(&dev)) {
        Ok(()) => 0,
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_upload_media_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let mime = CStr::from_ptr(mime).to_string_lossy().to_string();
    let slice = std::slice::from_raw_parts(data, len);
    match handle
        .runtime
        .block_on(handle.client().upload_media(slice, &mime))
    {
        Ok(uri) => {
            let c = CString::new(uri).unwrap();
            *out_uri = c.into_raw();
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_client_download_media_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let uri = CStr::from_ptr(uri).to_string_lossy().to_string();
    match handle
        .runtime
        .block_on(handle.client().download_media(&uri))
    {
        Ok(data) => {
            let len = data.len();
            let ptr = libc::malloc(len);
            if ptr.is_null() {
                set_error(err_out, "alloc failed".into());
                return 3;
            }
            std::ptr::copy_nonoverlapping(data.as_ptr(), ptr as *mut u8, len);
            *out_buf = ptr as *mut u8;
            *out_len = len;
            0
        }
        Err(e) => {
            set_error(err_out, e.to_string());
            2
        }
    }
}

#[inline(never)]
pub(crate) unsafe fn hum_free_buf_impl(ptr: *mut u8, _len: usize) {
    if ptr.is_null() {
        return;
    }
    libc::free(ptr as *mut libc::c_void)
}

#[inline(never)]
pub(crate) unsafe fn hum_client_send_read_receipt_impl(
    handle: *mut HumClientHandle,
    room_id: *const c_char,
    event_id: *const c_char,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
    let rid = CStr::from_ptr(room_id).to_string_lossy().to_string();
    let eid = CStr::from_ptr(event_id).to_string_lossy().to_string();
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

#[inline(never)]
pub(crate) unsafe fn hum_client_set_presence_impl(
    handle: *mut HumClientHandle,
    state: u32,
    err_out: *mut *mut c_char,
) -> c_int {
    if handle.is_null() {
        set_error(err_out, "null handle".into());
        return 1;
    }
    let handle = &*(handle as *mut HandleInner);
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

#[inline(never)]
pub(crate) unsafe fn hum_client_get_presence_impl(
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
    let handle = &*(handle as *mut HandleInner);
    let uid = CStr::from_ptr(user_id).to_string_lossy().to_string();
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
            *out_state = code;
            0
        }
        Err(e) => {
            set_error(err_out, e);
            2
        }
    }
}
