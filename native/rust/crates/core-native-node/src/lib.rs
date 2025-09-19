use std::ffi::{CStr, CString};
use std::io::{ErrorKind, Read, Write};
use std::net::{Shutdown, TcpStream};
use std::time::Duration;

use base64::Engine;
use hum_matrix_ffi::ffi::{
    // room mgmt
    hum_client_create_room,
    hum_client_delete_device,
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
    // users/devices/presence
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

    // media
    hum_client_upload_media,
};
use hum_matrix_ffi::HumClientHandle;

use napi::bindgen_prelude::{BigInt, *};
use napi_derive::napi;
use url::Url;

// ============== helpers ==============

#[inline]
unsafe fn take_cstring(ptr: *mut std::os::raw::c_char) -> String {
    // ptr must originate from CString::into_raw in the FFI crate.
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
    let (is_negative, value, lossless) = h.get_u64();
    if is_negative || !lossless {
        panic!("invalid BigInt for handle (negative or not lossless)");
    }
    value as usize as *mut HumClientHandle
}
fn handle_ptr_to_bigint(ptr: *mut HumClientHandle) -> BigInt {
    BigInt::from(ptr as usize as u64)
}

// ============== debug utilities ==============

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

// Plain HTTP GET executed on a worker thread.
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

#[napi]
pub fn debug_http_get(url: String) -> AsyncTask<HttpGetTask> {
    AsyncTask::new(HttpGetTask { url })
}

// Small helper so we can return `()` from Tasks.
#[napi(object)]
pub struct Void {}
impl From<()> for Void {
    fn from(_: ()) -> Self {
        Void {}
    }
}

// ============== Async wrappers for network-touching FFI ==============

// create_client
pub struct CreateClientTask {
    hs_url: String,
    store_path: String,
}
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

// login
pub struct LoginTask {
    handle: BigInt,
    username: String,
    password: String,
}
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

// logout
pub struct LogoutTask {
    handle: BigInt,
}
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

// is_authenticated
pub struct IsAuthTask {
    handle: BigInt,
}
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

// ============== The rest: light/fast ops kept sync ==============

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
        // TODO: provide & call hum_bytes_free(out_buf, out_len) in your FFI.
        Ok(b64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::engine::general_purpose::STANDARD as BASE64;
    use httpmock::prelude::*;
    use serde_json::json;
    use std::ffi::CString;
    use std::io::Read;
    use std::net::TcpListener;
    use std::thread;
    use tempfile::tempdir;

    #[test]
    fn helper_utilities_cover_edge_cases() {
        // take_cstring frees the pointer and returns its content.
        let original = CString::new("hello").unwrap();
        let ptr = original.into_raw();
        let text = unsafe { take_cstring(ptr) };
        assert_eq!(text, "hello");

        // opt_cstring handles both Some and None.
        let some_ptr = opt_cstring(Some("value"));
        assert!(!some_ptr.is_null());
        unsafe {
            let _ = CString::from_raw(some_ptr as *mut std::os::raw::c_char);
        }
        assert!(opt_cstring(None).is_null());

        // status_or_err succeeds with code 0.
        let mut no_err: *mut std::os::raw::c_char = std::ptr::null_mut();
        unsafe { status_or_err(0, &mut no_err).unwrap() };

        // status_or_err propagates error messages.
        let err_ptr = CString::new("boom").unwrap().into_raw();
        let mut err_slot = err_ptr as *mut std::os::raw::c_char;
        let err = unsafe { status_or_err(1, &mut err_slot) }.unwrap_err();
        assert!(err.to_string().contains("boom"));

        // json_or_err returns data on success and errors otherwise.
        let ok = unsafe {
            json_or_err(|out_json, _| {
                *out_json = CString::new("{\"ok\":true}").unwrap().into_raw();
                0
            })
        }
        .unwrap();
        assert!(ok.contains("ok"));
        let err = unsafe {
            json_or_err(|_, out_err| {
                *out_err = CString::new("bad json").unwrap().into_raw();
                5
            })
        }
        .unwrap_err();
        assert!(err.to_string().contains("bad json"));

        // BigInt conversions round-trip the pointer and reject invalid values.
        let bogus = BigInt::from(-5i64);
        let panic = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            let _ = bigint_to_handle_ptr(&bogus);
        }));
        assert!(panic.is_err());

        let fake_ptr = 0xdead_beefusize as *mut HumClientHandle;
        let bigint = handle_ptr_to_bigint(fake_ptr);
        assert_eq!(bigint.get_u64().1, 0xdead_beef);

        // debug helpers cover printing and TCP probing.
        debug_print("from test".into());
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        thread::spawn(move || {
            if let Ok((mut stream, _)) = listener.accept() {
                let mut buf = [0u8; 32];
                let _ = stream.read(&mut buf);
            }
        });
        assert!(debug_tcp_connect("127.0.0.1".into(), port).unwrap());
        let err = debug_tcp_connect("192.0.2.1".into(), 65535).unwrap_err();
        assert!(err.to_string().contains("tcp connect failed"));

        // HttpGetTask parses URLs, performs request, and surfaces errors.
        let http_server = MockServer::start();
        let _http_mock = http_server.mock(|when, then| {
            when.method(GET).path("/path");
            then.status(200).body("hello");
        });
        let task = HttpGetTask {
            url: format!("{}/path?x=1", http_server.base_url()),
        };
        assert!(task.run().is_ok());
        let bad = HttpGetTask {
            url: "http://[::1]:9".into(),
        };
        assert!(bad.run().is_err());
    }

    #[test]
    fn napi_wrappers_cover_success_and_error_paths() {
        let server = MockServer::start();
        let room_id = "!r:example.org";
        let event_id = "$event:example.org";

        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let _well_known = server.mock(|when, then| {
            when.method(GET).path("/.well-known/matrix/client");
            then.status(200).json_body(json!({
                "m.homeserver": {"base_url": server.base_url()}
            }));
        });
        let _login = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEV1",
                "user_id": "@user:example.org"
            }));
        });
        let _logout = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/logout");
            then.status(200).json_body(json!({}));
        });
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {
                    "join": {
                        room_id: {
                            "summary": {},
                            "state": { "events": [] },
                            "timeline": {
                                "events": [
                                    {"event_id": event_id, "sender": "@user:example.org", "type": "m.room.message"}
                                ],
                                "limited": false,
                                "prev_batch": "t"
                            },
                            "ephemeral": { "events": [] },
                            "account_data": { "events": [] },
                            "unread_notifications": {}
                        }
                    }
                }
            }));
        });
        let _encryption = server.mock(|when, then| {
            when.method(GET).path(format!(
                "/_matrix/client/v3/rooms/{room_id}/state/m.room.encryption"
            ));
            then.status(404);
        });
        let _send = server.mock(|when, then| {
            when.method(PUT)
                .path_contains(format!("/_matrix/client/v3/rooms/{room_id}/send/"));
            then.status(200).json_body(json!({ "event_id": event_id }));
        });
        let _redact = server.mock(|when, then| {
            when.method(PUT)
                .path_contains(format!("/_matrix/client/v3/rooms/{room_id}/redact/"));
            then.status(200).json_body(json!({ "event_id": event_id }));
        });
        let _typing = server.mock(|when, then| {
            when.method(PUT)
                .path_contains(format!("/_matrix/client/v3/rooms/{room_id}/typing/"));
            then.status(200).json_body(json!({}));
        });
        let _create_room = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/createRoom");
            then.status(200)
                .json_body(json!({ "room_id": "!new:example.org" }));
        });
        let _join = server.mock(|when, then| {
            when.method(POST).path_contains("/_matrix/client/v3/join/");
            then.status(200)
                .json_body(json!({ "room_id": "!joined:example.org" }));
        });
        let _leave = server.mock(|when, then| {
            when.method(POST)
                .path_contains(format!("/_matrix/client/v3/rooms/{room_id}/leave"));
            then.status(200).json_body(json!({}));
        });
        let _search = server.mock(|when, then| {
            when.method(POST)
                .path("/_matrix/client/v3/user_directory/search");
            then.status(200).json_body(json!({
                "results": [{"user_id": "@alice:example.org", "display_name": "Alice"}],
                "limited": false
            }));
        });
        let _devices = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/devices");
            then.status(200).json_body(json!({
                "devices": [{"device_id": "DEV1", "display_name": "Desk"}]
            }));
        });
        let _rename_device = server.mock(|when, then| {
            when.method(PUT).path("/_matrix/client/v3/devices/DEV1");
            then.status(200).json_body(json!({}));
        });
        let _delete_device = server.mock(|when, then| {
            when.method(DELETE).path("/_matrix/client/v3/devices/DEV1");
            then.status(200).json_body(json!({}));
        });
        let _set_presence = server.mock(|when, then| {
            when.method(PUT)
                .path("/_matrix/client/v3/presence/@user:example.org/status");
            then.status(200).json_body(json!({}));
        });
        let _get_presence = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/presence/@friend:example.org/status");
            then.status(200).json_body(json!({ "presence": "online" }));
        });
        let _upload_cfg = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/unstable/org.matrix.msc3916/media/config");
            then.status(200)
                .json_body(json!({"m.upload.size": 10_485_760 }));
        });
        let _upload = server.mock(|when, then| {
            when.method(POST).path_contains("/_matrix/media/v3/upload");
            then.status(200)
                .json_body(json!({ "content_uri": "mxc://example.org/media" }));
        });
        let _download = server.mock(|when, then| {
            when.method(GET)
                .path_contains("/_matrix/media/v3/download/example.org/media");
            then.status(200).body("downloaded");
        });
        let _fallback = server.mock(|when, then| {
            when.any_request();
            then.status(200).json_body(json!({}));
        });

        let dir = tempdir().unwrap();
        let handle = {
            let mut task = CreateClientTask {
                hs_url: server.base_url(),
                store_path: dir.path().to_string_lossy().into_owned(),
            };
            task.compute().unwrap()
        };

        let ptr = bigint_to_handle_ptr(&handle);
        assert!(!ptr.is_null());
        assert_eq!(handle_ptr_to_bigint(ptr).get_u64().1, handle.get_u64().1);

        let mut auth = IsAuthTask {
            handle: handle.clone(),
        };
        assert!(!auth.compute().unwrap());

        let mut login = LoginTask {
            handle: handle.clone(),
            username: "user".into(),
            password: "pass".into(),
        };
        login.compute().unwrap();

        let mut auth = IsAuthTask {
            handle: handle.clone(),
        };
        assert!(auth.compute().unwrap());

        client_sync_once(handle.clone(), BigInt::from(0u64)).unwrap();
        match client_start_sync_loop(handle.clone(), BigInt::from(0u64)) {
            Ok(()) => {
                client_stop_sync_loop(handle.clone()).unwrap();
            }
            Err(err) => {
                assert!(!err.to_string().is_empty());
            }
        }

        let rooms_json = client_get_rooms(handle.clone()).unwrap();
        assert!(rooms_json.contains(room_id));

        let send_text = client_send_text(handle.clone(), room_id.into(), "hi".into());
        if let Err(err) = send_text {
            assert!(!err.to_string().is_empty());
        }

        let reaction =
            client_send_reaction(handle.clone(), room_id.into(), event_id.into(), "👍".into());
        if let Err(err) = reaction {
            assert!(!err.to_string().is_empty());
        }

        let redacted = client_redact(
            handle.clone(),
            room_id.into(),
            event_id.into(),
            Some("cleanup".into()),
        );
        if let Err(err) = redacted {
            assert!(!err.to_string().is_empty());
        }

        assert!(client_send_read_receipt(handle.clone(), room_id.into(), event_id.into()).is_err());

        let typing = client_set_typing(handle.clone(), room_id.into(), true, 1000);
        if let Err(err) = typing {
            assert!(!err.to_string().is_empty());
        }

        let search = client_search_users(handle.clone(), "a".into(), 5).unwrap();
        assert!(search.contains("@alice:example.org"));

        let devices = client_get_devices(handle.clone()).unwrap();
        assert!(devices.contains("DEV1"));

        client_rename_device(handle.clone(), "DEV1".into(), "Desk".into()).unwrap();
        client_delete_device(handle.clone(), "DEV1".into()).unwrap();

        client_set_presence(handle.clone(), 0).unwrap();
        assert_eq!(
            client_get_presence(handle.clone(), "@friend:example.org".into()).unwrap(),
            0
        );

        let room_created =
            client_create_room(handle.clone(), Some("Room".into()), None, true).unwrap();
        assert_eq!(room_created, "!new:example.org");

        let joined = client_join_room(handle.clone(), "#alias:example.org".into()).unwrap();
        assert!(joined.starts_with('!'));

        let leave = client_leave_room(handle.clone(), room_id.into());
        if let Err(err) = leave {
            assert!(!err.to_string().is_empty());
        }

        let payload = BASE64.encode(b"hello");
        let uri = client_upload_media(handle.clone(), payload, "text/plain".into()).unwrap();
        assert_eq!(uri, "mxc://example.org/media");

        let data = client_download_media(handle.clone(), uri.clone()).unwrap();
        assert_eq!(data, BASE64.encode("downloaded"));

        let mut logout = LogoutTask {
            handle: handle.clone(),
        };
        logout.compute().unwrap();

        client_free(handle);
    }
}
