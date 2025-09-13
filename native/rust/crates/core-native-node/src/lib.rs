use std::ffi::{CStr, CString};
use std::io::{ErrorKind, Read, Write};
use std::net::{Shutdown, TcpStream};
use std::time::Duration;

use base64::Engine;
use hum_matrix_ffi::c_api::{
    // room mgmt
    hum_client_create_room,
    // users/devices/presence
    hum_client_delete_device,
    // media
    hum_client_download_media,
    // lifecycle / auth
    hum_client_free,
    hum_client_get_devices,
    hum_client_get_presence,
    // rooms/messages
    hum_client_get_rooms,
    hum_client_is_authenticated,
    hum_client_join_room,
    hum_client_leave_room,
    hum_client_login,
    hum_client_logout,
    hum_client_new,
    hum_client_redact,
    hum_client_rename_device,
    hum_client_search_users,
    hum_client_send_reaction,
    hum_client_send_read_receipt,
    hum_client_send_text,
    hum_client_set_presence,
    hum_client_set_typing,
    // sync
    hum_client_start_sync_loop,
    hum_client_stop_sync_loop,
    hum_client_sync_once,
    hum_client_upload_media,
    // types
    HumClientHandle,
};

use napi::bindgen_prelude::{BigInt, *};
use napi_derive::napi;
use url::Url;

// -------------------- small helpers --------------------

#[inline]
unsafe fn take_cstring(ptr: *mut std::os::raw::c_char) -> String {
    // ptr must come from CString::into_raw in the FFI crate.
    let s = CStr::from_ptr(ptr).to_string_lossy().into_owned();
    let _ = CString::from_raw(ptr); // free with this process' allocator
    s
}

#[inline]
fn opt_cstring(s: Option<&str>) -> *const std::os::raw::c_char {
    match s {
        Some(v) => CString::new(v).unwrap().into_raw(),
        None => std::ptr::null(),
    }
}

unsafe fn status_or_err(
    status: std::os::raw::c_int,
    err_out: *mut *mut std::os::raw::c_char,
) -> Result<()> {
    if status == 0 {
        Ok(())
    } else {
        let err_ptr = *err_out;
        if err_ptr.is_null() {
            Err(Error::from_reason("native error (unknown)"))
        } else {
            Err(Error::from_reason(take_cstring(err_ptr)))
        }
    }
}

unsafe fn json_or_err<F>(mut f: F) -> Result<String>
where
    F: FnMut(*mut *mut std::os::raw::c_char, *mut *mut std::os::raw::c_char) -> std::os::raw::c_int,
{
    let mut out_json: *mut std::os::raw::c_char = std::ptr::null_mut();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    let status = f(&mut out_json, &mut out_err);
    if status == 0 {
        Ok(take_cstring(out_json))
    } else if !out_err.is_null() {
        Err(Error::from_reason(take_cstring(out_err)))
    } else {
        Err(Error::from_reason("native error (unknown)"))
    }
}

// BigInt <-> pointer conversions
fn bigint_to_handle_ptr(h: &BigInt) -> *mut HumClientHandle {
    let (neg, v, lossless) = h.get_u64();
    if neg || !lossless {
        panic!("invalid BigInt for handle");
    }
    v as usize as *mut HumClientHandle
}
fn handle_ptr_to_bigint(ptr: *mut HumClientHandle) -> BigInt {
    BigInt::from(ptr as usize as u64)
}

// -------------------- debug utilities --------------------

#[napi]
pub fn debug_print(msg: String) {
    println!("[NAPI] {}", msg);
}

#[napi]
pub fn debug_tcp_connect(host: String, port: u16) -> Result<bool> {
    let addr = format!("{}:{}", host, port);
    match TcpStream::connect_timeout(&addr.parse().unwrap(), Duration::from_secs(2)) {
        Ok(_) => Ok(true),
        Err(e) => Err(Error::from_reason(format!("tcp connect failed: {e}"))),
    }
}

#[napi]
impl Task for HttpGetTask {
    type Output = String;
    type JsValue = String;

    fn compute(&mut self) -> Result<Self::Output> {
        self.run()
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

// Run a blocking plain-HTTP GET off the main thread
pub struct HttpGetTask {
    url: String,
}

impl HttpGetTask {
    fn run(&self) -> Result<String> {
        let url = Url::parse(&self.url).map_err(|e| Error::from_reason(e.to_string()))?;
        let host = url
            .host_str()
            .ok_or_else(|| Error::from_reason("no host"))?;
        let port = url
            .port_or_known_default()
            .ok_or_else(|| Error::from_reason("no port"))?;
        let path = if url.path().is_empty() {
            "/"
        } else {
            url.path()
        };
        let full_path = if let Some(q) = url.query() {
            format!("{path}?{q}")
        } else {
            path.to_string()
        };

        let mut stream = TcpStream::connect(format!("{host}:{port}"))
            .map_err(|e| Error::from_reason(format!("connect failed: {e}")))?;
        stream
            .set_read_timeout(Some(Duration::from_millis(200)))
            .ok();

        let req =
            format!("GET {full_path} HTTP/1.1\r\nHost: {host}:{port}\r\nConnection: close\r\n\r\n");
        stream
            .write_all(req.as_bytes())
            .map_err(|e| Error::from_reason(format!("write failed: {e}")))?;
        let _ = stream.shutdown(Shutdown::Write);

        // Read to EOF with small backoff on WouldBlock
        let mut buf = Vec::new();
        let mut chunk = [0u8; 4096];
        let started = std::time::Instant::now();
        let deadline = Duration::from_secs(8);

        loop {
            if started.elapsed() > deadline {
                if buf.is_empty() {
                    return Err(Error::from_reason("timeout waiting for response"));
                } else {
                    break;
                }
            }
            match stream.read(&mut chunk) {
                Ok(0) => break,
                Ok(n) => buf.extend_from_slice(&chunk[..n]),
                Err(e) if e.kind() == ErrorKind::WouldBlock || e.kind() == ErrorKind::TimedOut => {
                    std::thread::sleep(Duration::from_millis(20));
                }
                Err(e) => return Err(Error::from_reason(format!("read failed: {e}"))),
            }
        }

        String::from_utf8(buf).map_err(|e| Error::from_reason(format!("utf8 decode failed: {e}")))
    }
}

#[napi]
pub fn debug_http_get(url: String) -> AsyncTask<HttpGetTask> {
    AsyncTask::new(HttpGetTask { url })
}

#[napi(object)]
pub struct Void {}

impl From<()> for Void {
    fn from(_: ()) -> Self {
        Void {}
    }
}

// -------------------- Async wrappers for network-touching FFI --------------------

// create_client
pub struct CreateClientTask {
    hs_url: String,
    store_path: String,
}

#[napi]
impl Task for CreateClientTask {
    type Output = BigInt;
    type JsValue = BigInt;

    fn compute(&mut self) -> Result<Self::Output> {
        let hs = CString::new(self.hs_url.clone()).unwrap();
        let store = CString::new(self.store_path.clone()).unwrap();
        let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
        let handle = unsafe { hum_client_new(hs.as_ptr(), store.as_ptr(), &mut out_err) };
        if handle.is_null() {
            let msg = if out_err.is_null() {
                "failed to create client (unknown)".to_string()
            } else {
                unsafe { take_cstring(out_err) }
            };
            return Err(Error::from_reason(msg));
        }
        Ok(handle_ptr_to_bigint(handle))
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

#[napi]
pub fn create_client(hs_url: String, store_path: String) -> AsyncTask<CreateClientTask> {
    AsyncTask::new(CreateClientTask { hs_url, store_path })
}

// client_login
pub struct LoginTask {
    handle: BigInt,
    username: String,
    password: String,
}
#[napi]
impl Task for LoginTask {
    type Output = ();
    type JsValue = Void;

    fn compute(&mut self) -> Result<Self::Output> {
        let ptr = bigint_to_handle_ptr(&self.handle);
        let u = CString::new(self.username.clone()).unwrap();
        let p = CString::new(self.password.clone()).unwrap();
        let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
        unsafe {
            status_or_err(
                hum_client_login(ptr, u.as_ptr(), p.as_ptr(), &mut out_err),
                &mut out_err,
            )
        }
    }

    fn resolve(&mut self, _env: Env, _output: Self::Output) -> Result<Self::JsValue> {
        Ok(Void {})
    }
}

#[napi]
pub fn client_login(handle: BigInt, username: String, password: String) -> AsyncTask<LoginTask> {
    AsyncTask::new(LoginTask {
        handle,
        username,
        password,
    })
}

// client_logout
pub struct LogoutTask {
    handle: BigInt,
}
#[napi]
impl Task for LogoutTask {
    type Output = ();
    type JsValue = Void;

    fn compute(&mut self) -> Result<Self::Output> {
        let ptr = bigint_to_handle_ptr(&self.handle);
        let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
        unsafe { status_or_err(hum_client_logout(ptr, &mut out_err), &mut out_err) }
    }

    fn resolve(&mut self, _env: Env, _output: Self::Output) -> Result<Self::JsValue> {
        Ok(Void {})
    }
}

#[napi]
pub fn client_logout(handle: BigInt) -> AsyncTask<LogoutTask> {
    AsyncTask::new(LogoutTask { handle })
}

// client_is_authenticated
pub struct IsAuthTask {
    handle: BigInt,
}
#[napi]
impl Task for IsAuthTask {
    type Output = bool;
    type JsValue = bool;

    fn compute(&mut self) -> Result<Self::Output> {
        let ptr = bigint_to_handle_ptr(&self.handle);
        let mut out = false;
        let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
        let status =
            unsafe { hum_client_is_authenticated(ptr, &mut out as *mut bool, &mut out_err) };
        unsafe {
            status_or_err(status, &mut out_err)?;
        }
        Ok(out)
    }

    fn resolve(&mut self, _env: Env, output: Self::Output) -> Result<Self::JsValue> {
        Ok(output)
    }
}

#[napi]
pub fn client_is_authenticated(handle: BigInt) -> AsyncTask<IsAuthTask> {
    AsyncTask::new(IsAuthTask { handle })
}

// -------------------- The rest (cheap/fast ops kept sync) --------------------

#[napi]
pub fn client_free(handle: BigInt) {
    let ptr = bigint_to_handle_ptr(&handle);
    unsafe { hum_client_free(ptr) };
}

#[napi]
pub fn client_get_rooms(handle: BigInt) -> Result<String> {
    let ptr = bigint_to_handle_ptr(&handle);
    unsafe { json_or_err(|out_json, out_err| hum_client_get_rooms(ptr, out_json, out_err)) }
}

#[napi]
pub fn client_send_text(handle: BigInt, room_id: String, body: String) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let rid = CString::new(room_id).unwrap();
    let b = CString::new(body).unwrap();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_send_text(ptr, rid.as_ptr(), b.as_ptr(), &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_start_sync_loop(handle: BigInt, timeout_ms: BigInt) -> Result<()> {
    let (neg, t_ms, lossless) = timeout_ms.get_u64();
    if neg || !lossless {
        return Err(Error::from_reason(
            "timeout must be a non-negative, lossless u64",
        ));
    }
    let ptr = bigint_to_handle_ptr(&handle);
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_start_sync_loop(ptr, t_ms, &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_stop_sync_loop(handle: BigInt) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe { status_or_err(hum_client_stop_sync_loop(ptr, &mut out_err), &mut out_err) }
}

#[napi]
pub fn client_sync_once(handle: BigInt, timeout_ms: BigInt) -> Result<()> {
    let (neg, t_ms, lossless) = timeout_ms.get_u64();
    if neg || !lossless {
        return Err(Error::from_reason(
            "timeout must be a non-negative, lossless u64",
        ));
    }
    let ptr = bigint_to_handle_ptr(&handle);
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe { status_or_err(hum_client_sync_once(ptr, t_ms, &mut out_err), &mut out_err) }
}

#[napi]
pub fn client_send_reaction(
    handle: BigInt,
    room_id: String,
    event_id: String,
    key: String,
) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let r = CString::new(room_id).unwrap();
    let e = CString::new(event_id).unwrap();
    let k = CString::new(key).unwrap();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_send_reaction(ptr, r.as_ptr(), e.as_ptr(), k.as_ptr(), &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_redact(
    handle: BigInt,
    room_id: String,
    event_id: String,
    reason: Option<String>,
) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let r = CString::new(room_id).unwrap();
    let e = CString::new(event_id).unwrap();
    let reason_ptr = opt_cstring(reason.as_deref());
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    let res = unsafe {
        status_or_err(
            hum_client_redact(ptr, r.as_ptr(), e.as_ptr(), reason_ptr, &mut out_err),
            &mut out_err,
        )
    };
    if !reason_ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(reason_ptr as *mut std::os::raw::c_char);
        }
    }
    res
}

#[napi]
pub fn client_send_read_receipt(handle: BigInt, room_id: String, event_id: String) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let r = CString::new(room_id).unwrap();
    let e = CString::new(event_id).unwrap();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_send_read_receipt(ptr, r.as_ptr(), e.as_ptr(), &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_set_typing(
    handle: BigInt,
    room_id: String,
    is_typing: bool,
    timeout_ms: u32,
) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let r = CString::new(room_id).unwrap();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_set_typing(ptr, r.as_ptr(), is_typing, timeout_ms, &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_search_users(handle: BigInt, query: String, limit: u32) -> Result<String> {
    let ptr = bigint_to_handle_ptr(&handle);
    let q = CString::new(query).unwrap();
    unsafe {
        json_or_err(|out_json, out_err| {
            hum_client_search_users(ptr, q.as_ptr(), limit, out_json, out_err)
        })
    }
}

#[napi]
pub fn client_get_devices(handle: BigInt) -> Result<String> {
    let ptr = bigint_to_handle_ptr(&handle);
    unsafe { json_or_err(|out_json, out_err| hum_client_get_devices(ptr, out_json, out_err)) }
}

#[napi]
pub fn client_rename_device(handle: BigInt, device_id: String, name: String) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let d = CString::new(device_id).unwrap();
    let n = CString::new(name).unwrap();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_rename_device(ptr, d.as_ptr(), n.as_ptr(), &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_delete_device(handle: BigInt, device_id: String) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let d = CString::new(device_id).unwrap();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_delete_device(ptr, d.as_ptr(), &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_set_presence(handle: BigInt, state_code: u32) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_set_presence(ptr, state_code, &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_get_presence(handle: BigInt, user_id: String) -> Result<u32> {
    let ptr = bigint_to_handle_ptr(&handle);
    let u = CString::new(user_id).unwrap();
    let mut out_state: u32 = 0;
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    let status = unsafe {
        hum_client_get_presence(ptr, u.as_ptr(), &mut out_state as *mut u32, &mut out_err)
    };
    unsafe {
        status_or_err(status, &mut out_err)?;
    }
    Ok(out_state)
}

#[napi]
pub fn client_create_room(
    handle: BigInt,
    name: Option<String>,
    topic: Option<String>,
    is_public: bool,
) -> Result<String> {
    let ptr = bigint_to_handle_ptr(&handle);
    let name_ptr = opt_cstring(name.as_deref());
    let topic_ptr = opt_cstring(topic.as_deref());
    let res = unsafe {
        json_or_err(|out_room_id, out_err| {
            hum_client_create_room(ptr, name_ptr, topic_ptr, is_public, out_room_id, out_err)
        })
    };
    if !name_ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(name_ptr as *mut std::os::raw::c_char);
        }
    }
    if !topic_ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(topic_ptr as *mut std::os::raw::c_char);
        }
    }
    res
}

#[napi]
pub fn client_join_room(handle: BigInt, id_or_alias: String) -> Result<String> {
    let ptr = bigint_to_handle_ptr(&handle);
    let s = CString::new(id_or_alias).unwrap();
    unsafe {
        json_or_err(|out_room_id, out_err| {
            hum_client_join_room(ptr, s.as_ptr(), out_room_id, out_err)
        })
    }
}

#[napi]
pub fn client_leave_room(handle: BigInt, room_id: String) -> Result<()> {
    let ptr = bigint_to_handle_ptr(&handle);
    let s = CString::new(room_id).unwrap();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    unsafe {
        status_or_err(
            hum_client_leave_room(ptr, s.as_ptr(), &mut out_err),
            &mut out_err,
        )
    }
}

#[napi]
pub fn client_upload_media(handle: BigInt, base64_data: String, mime: String) -> Result<String> {
    let ptr = bigint_to_handle_ptr(&handle);
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(base64_data.as_bytes())
        .map_err(|e| Error::from_reason(format!("base64 decode failed: {e}")))?;
    let m = CString::new(mime).unwrap();

    let mut out_uri: *mut std::os::raw::c_char = std::ptr::null_mut();
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();
    let status = unsafe {
        hum_client_upload_media(
            ptr,
            bytes.as_ptr(),
            bytes.len(),
            m.as_ptr(),
            &mut out_uri,
            &mut out_err,
        )
    };
    unsafe {
        if status == 0 {
            Ok(take_cstring(out_uri))
        } else if !out_err.is_null() {
            Err(Error::from_reason(take_cstring(out_err)))
        } else {
            Err(Error::from_reason("upload failed"))
        }
    }
}

#[napi]
pub fn client_download_media(handle: BigInt, uri: String) -> Result<String> {
    let ptr = bigint_to_handle_ptr(&handle);
    let u = CString::new(uri).unwrap();

    let mut out_buf: *mut u8 = std::ptr::null_mut();
    let mut out_len: usize = 0;
    let mut out_err: *mut std::os::raw::c_char = std::ptr::null_mut();

    let status = unsafe {
        hum_client_download_media(ptr, u.as_ptr(), &mut out_buf, &mut out_len, &mut out_err)
    };
    unsafe {
        if status != 0 {
            if !out_err.is_null() {
                return Err(Error::from_reason(take_cstring(out_err)));
            }
            return Err(Error::from_reason("download failed"));
        }
        let slice = std::slice::from_raw_parts(out_buf, out_len);
        let b64 = base64::engine::general_purpose::STANDARD.encode(slice);
        // TODO: provide & call hum_bytes_free(out_buf, out_len) in your FFI
        Ok(b64)
    }
}
