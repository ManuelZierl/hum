use std::ffi::{CStr, CString};
use std::io::{ErrorKind, Read, Write};
use std::net::{Shutdown, TcpStream};
use std::time::Duration;

use base64::Engine;
#[cfg(not(test))]
mod ffi {
    pub use hum_matrix_ffi::c_api::*;
}

use ffi::{
    hum_client_create_room, hum_client_delete_device, hum_client_download_media, hum_client_free,
    hum_client_get_devices, hum_client_get_presence, hum_client_get_rooms,
    hum_client_is_authenticated, hum_client_join_room, hum_client_leave_room, hum_client_login,
    hum_client_logout, hum_client_new, hum_client_redact, hum_client_rename_device,
    hum_client_search_users, hum_client_send_reaction, hum_client_send_read_receipt,
    hum_client_send_text, hum_client_set_presence, hum_client_set_typing,
    hum_client_start_sync_loop, hum_client_stop_sync_loop, hum_client_sync_once,
    hum_client_upload_media, HumClientHandle,
};

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
mod ffi {
    use std::cell::RefCell;
    use std::os::raw::{c_char, c_int};

    pub struct HumClientHandle {
        pub _id: usize,
    }

    macro_rules! allow_unused_unit {
        (() => $($rest:tt)*) => {
            #[allow(clippy::unused_unit)]
            $($rest)*
        };
        ($ret:ty => $($rest:tt)*) => {
            $($rest)*
        };
    }

    macro_rules! define_mocks {
        ($(fn $name:ident($($arg:ident : $arg_ty:ty),* $(,)?) -> $ret:ty);* $(;)?) => {
            pub struct Mocks {
                $(pub $name: Option<Box<dyn FnMut($($arg_ty),*) -> $ret>>,)*
            }

            impl Default for Mocks {
                fn default() -> Self {
                    Self {
                        $($name: None,)*
                    }
                }
            }

            thread_local! {
                pub static MOCKS: RefCell<Mocks> = RefCell::new(Mocks::default());
            }

            pub fn reset_mocks() {
                MOCKS.with(|cell| *cell.borrow_mut() = Mocks::default());
            }

            $(
            allow_unused_unit! {
                $ret =>
                pub unsafe extern "C" fn $name($($arg: $arg_ty),*) -> $ret {
                    MOCKS.with(|cell| {
                        let mut mocks = cell.borrow_mut();
                        let cb = mocks
                            .$name
                            .as_mut()
                            .expect(concat!(stringify!($name), " not mocked"));
                        cb($($arg),*)
                    })
                }
            }
            )*
        };
    }

    define_mocks! {
        fn hum_client_new(
            hs_url: *const c_char,
            store_path: *const c_char,
            err_out: *mut *mut c_char,
        ) -> *mut HumClientHandle;
        fn hum_client_login(
            handle: *mut HumClientHandle,
            username: *const c_char,
            password: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_logout(
            handle: *mut HumClientHandle,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_is_authenticated(
            handle: *mut HumClientHandle,
            out_is_auth: *mut bool,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_free(handle: *mut HumClientHandle) -> ();
        fn hum_client_get_rooms(
            handle: *mut HumClientHandle,
            out_json: *mut *mut c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_send_text(
            handle: *mut HumClientHandle,
            room_id: *const c_char,
            body: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_start_sync_loop(
            handle: *mut HumClientHandle,
            timeout_ms: u64,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_stop_sync_loop(
            handle: *mut HumClientHandle,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_sync_once(
            handle: *mut HumClientHandle,
            timeout_ms: u64,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_send_reaction(
            handle: *mut HumClientHandle,
            room_id: *const c_char,
            event_id: *const c_char,
            key: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_redact(
            handle: *mut HumClientHandle,
            room_id: *const c_char,
            event_id: *const c_char,
            reason: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_send_read_receipt(
            handle: *mut HumClientHandle,
            room_id: *const c_char,
            event_id: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_set_typing(
            handle: *mut HumClientHandle,
            room_id: *const c_char,
            is_typing: bool,
            timeout_ms: u32,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_search_users(
            handle: *mut HumClientHandle,
            query: *const c_char,
            limit: u32,
            out_json: *mut *mut c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_get_devices(
            handle: *mut HumClientHandle,
            out_json: *mut *mut c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_rename_device(
            handle: *mut HumClientHandle,
            device_id: *const c_char,
            name: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_delete_device(
            handle: *mut HumClientHandle,
            device_id: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_set_presence(
            handle: *mut HumClientHandle,
            state_code: u32,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_get_presence(
            handle: *mut HumClientHandle,
            user_id: *const c_char,
            out_state: *mut u32,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_create_room(
            handle: *mut HumClientHandle,
            name: *const c_char,
            topic: *const c_char,
            is_public: bool,
            out_room_id: *mut *mut c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_join_room(
            handle: *mut HumClientHandle,
            id_or_alias: *const c_char,
            out_room_id: *mut *mut c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_leave_room(
            handle: *mut HumClientHandle,
            room_id: *const c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_upload_media(
            handle: *mut HumClientHandle,
            data: *const u8,
            len: usize,
            mime: *const c_char,
            out_uri: *mut *mut c_char,
            err_out: *mut *mut c_char,
        ) -> c_int;
        fn hum_client_download_media(
            handle: *mut HumClientHandle,
            uri: *const c_char,
            out_buf: *mut *mut u8,
            out_len: *mut usize,
            err_out: *mut *mut c_char,
        ) -> c_int;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ffi::{reset_mocks, HumClientHandle, MOCKS};
    use base64::Engine;
    use std::cell::RefCell;
    use std::ffi::{CStr, CString};
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::rc::Rc;
    use std::thread;

    fn make_handle(id: usize) -> (*mut HumClientHandle, BigInt) {
        let handle = Box::into_raw(Box::new(HumClientHandle { _id: id }));
        let bigint = handle_ptr_to_bigint(handle);
        (handle, bigint)
    }

    fn drop_handle(ptr: *mut HumClientHandle) {
        unsafe {
            drop(Box::from_raw(ptr));
        }
    }

    fn assert_valid_err_out(err_out: *mut *mut std::os::raw::c_char) {
        assert!(!err_out.is_null());
        unsafe {
            assert!((*err_out).is_null());
        }
    }

    #[test]
    fn test_take_cstring() {
        let original = CString::new("hello").unwrap();
        let raw = original.into_raw();
        let result = unsafe { take_cstring(raw) };
        assert_eq!(result, "hello");
    }

    #[test]
    fn test_opt_cstring() {
        let ptr = opt_cstring(Some("abc"));
        assert!(!ptr.is_null());
        unsafe {
            let restored = CString::from_raw(ptr as *mut std::os::raw::c_char);
            assert_eq!(restored.to_str().unwrap(), "abc");
        }
        let null_ptr = opt_cstring(None);
        assert!(null_ptr.is_null());
    }

    #[test]
    fn test_status_or_err_success() {
        let mut err_out: *mut std::os::raw::c_char = std::ptr::null_mut();
        let res = unsafe { status_or_err(0, &mut err_out) };
        assert!(res.is_ok());
    }

    #[test]
    fn test_status_or_err_with_message() {
        let mut err_msg = CString::new("boom").unwrap().into_raw();
        let err_out = &mut err_msg as *mut *mut std::os::raw::c_char;
        let err = unsafe { status_or_err(1, err_out) };
        assert_eq!(err.unwrap_err().reason, "boom");
    }

    #[test]
    fn test_status_or_err_unknown() {
        let mut err_out: *mut std::os::raw::c_char = std::ptr::null_mut();
        let err = unsafe { status_or_err(2, &mut err_out) };
        assert_eq!(err.unwrap_err().reason, "native error (unknown)");
    }

    #[test]
    fn test_json_or_err_success() {
        let result = unsafe {
            json_or_err(|out_json, out_err| {
                let _ = out_err;
                *out_json = CString::new("{\"ok\":true}").unwrap().into_raw();
                0
            })
        }
        .unwrap();
        assert_eq!(result, "{\"ok\":true}");
    }

    #[test]
    fn test_json_or_err_with_message() {
        let err = unsafe {
            json_or_err(|out_json, out_err| {
                *out_json = std::ptr::null_mut();
                *out_err = CString::new("bad").unwrap().into_raw();
                1
            })
        }
        .unwrap_err();
        assert_eq!(err.reason, "bad");
    }

    #[test]
    fn test_json_or_err_unknown() {
        let err = unsafe {
            json_or_err(|out_json, _out_err| {
                *out_json = std::ptr::null_mut();
                1
            })
        }
        .unwrap_err();
        assert_eq!(err.reason, "native error (unknown)");
    }

    #[test]
    fn test_bigint_handle_conversion() {
        let (ptr, bigint) = make_handle(7);
        let restored = bigint_to_handle_ptr(&bigint);
        assert_eq!(ptr, restored);
        drop_handle(ptr);
    }

    #[test]
    fn test_bigint_to_handle_ptr_invalid() {
        let negative = BigInt::from(-1i64);
        assert!(std::panic::catch_unwind(|| bigint_to_handle_ptr(&negative)).is_err());
        let huge = BigInt::from(u128::MAX);
        assert!(std::panic::catch_unwind(|| bigint_to_handle_ptr(&huge)).is_err());
    }

    #[test]
    fn test_debug_tcp_connect() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let handle = thread::spawn(move || {
            let _ = listener.accept();
        });
        assert!(debug_tcp_connect("127.0.0.1".into(), addr.port()).unwrap());
        handle.join().unwrap();
        let err = debug_tcp_connect("127.0.0.1".into(), 9).unwrap_err();
        assert!(err.reason.contains("tcp connect failed"));
    }

    #[test]
    fn test_http_get_task() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        thread::spawn(move || {
            if let Ok((mut stream, _)) = listener.accept() {
                let mut buf = [0u8; 1024];
                let _ = stream.read(&mut buf);
                let response = b"HTTP/1.1 200 OK\r\nContent-Length: 4\r\n\r\ntest";
                let _ = stream.write_all(response);
            }
        });
        let url = format!("http://127.0.0.1:{}/path", addr.port());
        let task = HttpGetTask { url: url.clone() };
        let body = task.run().unwrap();
        assert!(body.contains("test"));

        let bad_task = HttpGetTask {
            url: "not a url".into(),
        };
        assert!(bad_task.run().is_err());
    }

    #[test]
    fn test_create_client_task() {
        reset_mocks();
        let hs = Rc::new(RefCell::new(None));
        let store = Rc::new(RefCell::new(None));
        let hs_capture = Rc::clone(&hs);
        let store_capture = Rc::clone(&store);
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_new =
                Some(Box::new(move |hs_url, store_path, err_out| {
                    assert_valid_err_out(err_out);
                    let hs_value = unsafe { CStr::from_ptr(hs_url) }
                        .to_str()
                        .unwrap()
                        .to_string();
                    let store_value = unsafe { CStr::from_ptr(store_path) }
                        .to_str()
                        .unwrap()
                        .to_string();
                    *hs_capture.borrow_mut() = Some(hs_value);
                    *store_capture.borrow_mut() = Some(store_value);
                    Box::into_raw(Box::new(HumClientHandle { _id: 1 }))
                }));
        });
        let mut task = CreateClientTask {
            hs_url: "https://example".into(),
            store_path: "store".into(),
        };
        let bigint = task.compute().unwrap();
        assert_eq!(hs.borrow().as_deref(), Some("https://example"));
        assert_eq!(store.borrow().as_deref(), Some("store"));
        let ptr = bigint_to_handle_ptr(&bigint);
        drop_handle(ptr);

        reset_mocks();
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_new = Some(Box::new(|_, _, err_out| {
                assert!(!err_out.is_null());
                unsafe {
                    *err_out = CString::new("nope").unwrap().into_raw();
                }
                std::ptr::null_mut()
            }));
        });
        let mut task = CreateClientTask {
            hs_url: "bad".into(),
            store_path: "bad".into(),
        };
        let err = task.compute().unwrap_err();
        assert_eq!(err.reason, "nope");
    }

    #[test]
    fn test_login_logout_is_auth_tasks() {
        reset_mocks();
        let (ptr, bigint) = make_handle(10);
        let ptr_login = ptr;
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_login =
                Some(Box::new(move |handle, user, pass, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_login);
                    assert_eq!(unsafe { CStr::from_ptr(user).to_str().unwrap() }, "user");
                    assert_eq!(unsafe { CStr::from_ptr(pass).to_str().unwrap() }, "pass");
                    0
                }));
        });
        let mut login = LoginTask {
            handle: bigint.clone(),
            username: "user".into(),
            password: "pass".into(),
        };
        login.compute().unwrap();

        reset_mocks();
        let ptr_logout = ptr;
        let bigint_clone = bigint.clone();
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_logout = Some(Box::new(move |handle, err_out| {
                assert_valid_err_out(err_out);
                assert_eq!(handle, ptr_logout);
                0
            }));
        });
        let mut logout = LogoutTask {
            handle: bigint_clone,
        };
        logout.compute().unwrap();

        reset_mocks();
        let ptr_auth = ptr;
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_is_authenticated =
                Some(Box::new(move |handle, out_is_auth, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_auth);
                    unsafe {
                        *out_is_auth = true;
                    }
                    0
                }));
        });
        let mut is_auth = IsAuthTask {
            handle: bigint.clone(),
        };
        assert!(is_auth.compute().unwrap());

        drop_handle(ptr);
    }

    #[test]
    fn test_client_free_and_get_rooms() {
        reset_mocks();
        let (ptr_free, bigint_free) = make_handle(1);
        let freed = Rc::new(RefCell::new(false));
        let freed_capture = Rc::clone(&freed);
        let ptr_free_copy = ptr_free;
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_free = Some(Box::new(move |handle| {
                assert_eq!(handle, ptr_free_copy);
                drop_handle(handle);
                *freed_capture.borrow_mut() = true;
            }));
        });
        client_free(bigint_free);
        assert!(*freed.borrow());

        reset_mocks();
        let (ptr_rooms, bigint_rooms) = make_handle(2);
        let ptr_rooms_copy = ptr_rooms;
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_get_rooms =
                Some(Box::new(move |handle, out_json, err_out| {
                    assert_eq!(handle, ptr_rooms_copy);
                    assert_valid_err_out(err_out);
                    unsafe {
                        *out_json = CString::new("rooms").unwrap().into_raw();
                    }
                    0
                }));
        });
        let rooms = client_get_rooms(bigint_rooms.clone()).unwrap();
        assert_eq!(rooms, "rooms");
        drop_handle(ptr_rooms);
    }

    #[test]
    fn test_client_send_and_sync_variants() {
        reset_mocks();
        let (ptr, bigint) = make_handle(3);
        let called = Rc::new(RefCell::new(Vec::new()));
        let called_capture = Rc::clone(&called);
        let ptr_send = ptr;
        let ptr_start = ptr;
        let ptr_stop = ptr;
        let ptr_once = ptr;
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_send_text =
                Some(Box::new(move |handle, room, body, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_send);
                    let room_str = unsafe { CStr::from_ptr(room).to_str().unwrap().to_string() };
                    let body_str = unsafe { CStr::from_ptr(body).to_str().unwrap().to_string() };
                    called_capture.borrow_mut().push((room_str, body_str));
                    0
                }));
            cell.borrow_mut().hum_client_start_sync_loop =
                Some(Box::new(move |handle, timeout, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_start);
                    assert_eq!(timeout, 4000);
                    0
                }));
            cell.borrow_mut().hum_client_stop_sync_loop = Some(Box::new(move |handle, err_out| {
                assert_valid_err_out(err_out);
                assert_eq!(handle, ptr_stop);
                0
            }));
            cell.borrow_mut().hum_client_sync_once =
                Some(Box::new(move |handle, timeout, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_once);
                    assert_eq!(timeout, 5000);
                    0
                }));
        });

        client_send_text(bigint.clone(), "room".into(), "body".into()).unwrap();
        assert_eq!(called.borrow().len(), 1);
        client_start_sync_loop(bigint.clone(), BigInt::from(4000u64)).unwrap();
        client_stop_sync_loop(bigint.clone()).unwrap();
        client_sync_once(bigint.clone(), BigInt::from(5000u64)).unwrap();
        assert!(client_start_sync_loop(bigint.clone(), BigInt::from(-1i64)).is_err());
        assert!(client_sync_once(bigint.clone(), BigInt::from(-1i64)).is_err());

        drop_handle(ptr);
    }

    #[test]
    fn test_client_reactions_and_receipts() {
        reset_mocks();
        let (ptr, bigint) = make_handle(4);
        let ptr_react = ptr;
        let ptr_redact = ptr;
        let ptr_receipt = ptr;
        let ptr_typing = ptr;
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_send_reaction =
                Some(Box::new(move |handle, room, event, key, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_react);
                    assert_eq!(unsafe { CStr::from_ptr(room).to_str().unwrap() }, "room");
                    assert_eq!(unsafe { CStr::from_ptr(event).to_str().unwrap() }, "event");
                    assert_eq!(unsafe { CStr::from_ptr(key).to_str().unwrap() }, "👍");
                    0
                }));
            cell.borrow_mut().hum_client_redact =
                Some(Box::new(move |handle, room, event, reason, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_redact);
                    assert_eq!(unsafe { CStr::from_ptr(room).to_str().unwrap() }, "room");
                    assert_eq!(unsafe { CStr::from_ptr(event).to_str().unwrap() }, "event");
                    assert_eq!(unsafe { CStr::from_ptr(reason).to_str().unwrap() }, "why");
                    0
                }));
            cell.borrow_mut().hum_client_send_read_receipt =
                Some(Box::new(move |handle, room, event, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_receipt);
                    assert_eq!(unsafe { CStr::from_ptr(room).to_str().unwrap() }, "room");
                    assert_eq!(unsafe { CStr::from_ptr(event).to_str().unwrap() }, "event");
                    0
                }));
            cell.borrow_mut().hum_client_set_typing = Some(Box::new(
                move |handle, room, is_typing, timeout, err_out| {
                    assert_valid_err_out(err_out);
                    assert_eq!(handle, ptr_typing);
                    assert!(is_typing);
                    assert_eq!(timeout, 30);
                    assert_eq!(unsafe { CStr::from_ptr(room).to_str().unwrap() }, "room");
                    0
                },
            ));
        });

        client_send_reaction(bigint.clone(), "room".into(), "event".into(), "👍".into()).unwrap();
        client_redact(
            bigint.clone(),
            "room".into(),
            "event".into(),
            Some("why".into()),
        )
        .unwrap();
        client_send_read_receipt(bigint.clone(), "room".into(), "event".into()).unwrap();
        client_set_typing(bigint.clone(), "room".into(), true, 30).unwrap();

        drop_handle(ptr);
    }

    #[test]
    fn test_client_search_devices_presence() {
        reset_mocks();
        let (ptr, bigint) = make_handle(5);
        let ptr_search = ptr;
        let ptr_devices = ptr;
        let ptr_rename = ptr;
        let ptr_delete = ptr;
        let ptr_set = ptr;
        let ptr_get = ptr;
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_search_users =
                Some(Box::new(move |handle, query, limit, out_json, err_out| {
                    assert_eq!(handle, ptr_search);
                    assert_eq!(limit, 3);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(query).to_str().unwrap(), "alice");
                        *out_json = CString::new("search").unwrap().into_raw();
                    }
                    0
                }));
            cell.borrow_mut().hum_client_get_devices =
                Some(Box::new(move |handle, out_json, err_out| {
                    assert_eq!(handle, ptr_devices);
                    assert_valid_err_out(err_out);
                    unsafe {
                        *out_json = CString::new("devices").unwrap().into_raw();
                    }
                    0
                }));
            cell.borrow_mut().hum_client_rename_device =
                Some(Box::new(move |handle, device, name, err_out| {
                    assert_eq!(handle, ptr_rename);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(device).to_str().unwrap(), "device");
                        assert_eq!(CStr::from_ptr(name).to_str().unwrap(), "My Device");
                    }
                    0
                }));
            cell.borrow_mut().hum_client_delete_device =
                Some(Box::new(move |handle, device, err_out| {
                    assert_eq!(handle, ptr_delete);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(device).to_str().unwrap(), "device");
                    }
                    0
                }));
            cell.borrow_mut().hum_client_set_presence =
                Some(Box::new(move |handle, state, err_out| {
                    assert_eq!(handle, ptr_set);
                    assert_eq!(state, 2);
                    assert_valid_err_out(err_out);
                    0
                }));
            cell.borrow_mut().hum_client_get_presence =
                Some(Box::new(move |handle, user, out_state, err_out| {
                    assert_eq!(handle, ptr_get);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(user).to_str().unwrap(), "@user:id");
                        *out_state = 1;
                    }
                    0
                }));
        });

        assert_eq!(
            client_search_users(bigint.clone(), "alice".into(), 3).unwrap(),
            "search"
        );
        assert_eq!(client_get_devices(bigint.clone()).unwrap(), "devices");
        client_rename_device(bigint.clone(), "device".into(), "My Device".into()).unwrap();
        client_delete_device(bigint.clone(), "device".into()).unwrap();
        client_set_presence(bigint.clone(), 2).unwrap();
        assert_eq!(
            client_get_presence(bigint.clone(), "@user:id".into()).unwrap(),
            1
        );

        drop_handle(ptr);
    }

    #[test]
    fn test_client_room_management_and_media() {
        reset_mocks();
        let (ptr, bigint) = make_handle(6);
        let ptr_create = ptr;
        let ptr_join = ptr;
        let ptr_leave = ptr;
        let ptr_upload = ptr;
        let ptr_download = ptr;
        let download_buffers = Rc::new(RefCell::new(Vec::new()));
        let buffers_capture = Rc::clone(&download_buffers);
        MOCKS.with(|cell| {
            cell.borrow_mut().hum_client_create_room = Some(Box::new(
                move |handle, name, topic, is_public, out_room_id, err_out| {
                    assert_eq!(handle, ptr_create);
                    assert!(is_public);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(name).to_str().unwrap(), "Name");
                        assert_eq!(CStr::from_ptr(topic).to_str().unwrap(), "Topic");
                        *out_room_id = CString::new("!room:id").unwrap().into_raw();
                    }
                    0
                },
            ));
            cell.borrow_mut().hum_client_join_room =
                Some(Box::new(move |handle, id, out_room_id, err_out| {
                    assert_eq!(handle, ptr_join);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(id).to_str().unwrap(), "#alias:id");
                        *out_room_id = CString::new("!joined:id").unwrap().into_raw();
                    }
                    0
                }));
            cell.borrow_mut().hum_client_leave_room = Some(Box::new(move |handle, id, err_out| {
                assert_eq!(handle, ptr_leave);
                assert_valid_err_out(err_out);
                unsafe {
                    assert_eq!(CStr::from_ptr(id).to_str().unwrap(), "!joined:id");
                }
                0
            }));
            cell.borrow_mut().hum_client_upload_media = Some(Box::new(
                move |handle, data, len, mime, out_uri, err_out| {
                    assert_eq!(handle, ptr_upload);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(mime).to_str().unwrap(), "image/png");
                        let slice = std::slice::from_raw_parts(data, len);
                        assert_eq!(slice, &[1, 2, 3]);
                        *out_uri = CString::new("mxc://uri").unwrap().into_raw();
                    }
                    0
                },
            ));
            cell.borrow_mut().hum_client_download_media =
                Some(Box::new(move |handle, uri, out_buf, out_len, err_out| {
                    assert_eq!(handle, ptr_download);
                    assert_valid_err_out(err_out);
                    unsafe {
                        assert_eq!(CStr::from_ptr(uri).to_str().unwrap(), "mxc://uri");
                        let mut data = vec![4u8, 5, 6];
                        *out_len = data.len();
                        let ptr = data.as_mut_ptr();
                        buffers_capture.borrow_mut().push((ptr, data.len()));
                        std::mem::forget(data);
                        *out_buf = ptr;
                    }
                    0
                }));
        });

        let room_id = client_create_room(
            bigint.clone(),
            Some("Name".into()),
            Some("Topic".into()),
            true,
        )
        .unwrap();
        assert_eq!(room_id, "!room:id");
        let joined = client_join_room(bigint.clone(), "#alias:id".into()).unwrap();
        assert_eq!(joined, "!joined:id");
        client_leave_room(bigint.clone(), "!joined:id".into()).unwrap();

        let upload = client_upload_media(
            bigint.clone(),
            base64::engine::general_purpose::STANDARD.encode([1u8, 2, 3]),
            "image/png".into(),
        )
        .unwrap();
        assert_eq!(upload, "mxc://uri");

        let download = client_download_media(bigint.clone(), "mxc://uri".into()).unwrap();
        assert_eq!(
            download,
            base64::engine::general_purpose::STANDARD.encode([4u8, 5, 6])
        );

        for (ptr, len) in download_buffers.borrow_mut().drain(..) {
            unsafe {
                drop(Vec::from_raw_parts(ptr, len, len));
            }
        }

        drop_handle(ptr);
    }
}
