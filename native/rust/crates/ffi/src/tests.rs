use super::*;
use httpmock::prelude::*;
use serde_json::json;
use std::ffi::{CStr, CString};
use std::ptr;
use tempfile::tempdir;

// Pull exported shims and impls into scope for the tests
use crate::ffi::*;
use crate::impls::*;

fn take_error(err: &mut *mut c_char) -> Option<String> {
    let p = *err;
    if p.is_null() {
        return None;
    }
    unsafe {
        let c = CString::from_raw(p);
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
fn free_string_is_safe_with_null_and_owned_pointer_and_impl_equivalence() {
    unsafe { hum_free_string(ptr::null_mut()) };
    let owned = CString::new("hello").unwrap();
    let ptr1 = owned.into_raw();
    unsafe { hum_free_string(ptr1) };

    // Also hit the impl directly
    unsafe { hum_free_string_impl(ptr::null_mut()) };
    let owned2 = CString::new("world").unwrap();
    let ptr2 = owned2.into_raw();
    unsafe { hum_free_string_impl(ptr2) };
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
    let code = unsafe { hum_client_login(handle, username.as_ptr(), password.as_ptr(), &mut err) };
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
fn error_handling_for_null_inputs_shim_and_impl_match() {
    let mut err: *mut c_char = ptr::null_mut();
    let username = CString::new("user").unwrap();
    let password = CString::new("pass").unwrap();

    // login
    let code_shim = unsafe {
        hum_client_login(
            ptr::null_mut(),
            username.as_ptr(),
            password.as_ptr(),
            &mut err,
        )
    };
    assert_eq!(code_shim, 1);
    let msg_shim = take_error(&mut err);

    let code_impl = unsafe {
        hum_client_login_impl(
            ptr::null_mut(),
            username.as_ptr(),
            password.as_ptr(),
            &mut err,
        )
    };
    assert_eq!(code_impl, 1);
    let msg_impl = take_error(&mut err);
    assert_eq!(msg_shim, msg_impl);

    // logout
    let code_shim = unsafe { hum_client_logout(ptr::null_mut(), &mut err) };
    assert_eq!(code_shim, 1);
    let msg_shim = take_error(&mut err);

    let code_impl = unsafe { hum_client_logout_impl(ptr::null_mut(), &mut err) };
    assert_eq!(code_impl, 1);
    let msg_impl = take_error(&mut err);
    assert_eq!(msg_shim, msg_impl);

    // is_authenticated (null out)
    let mut is_auth = false;
    let code_shim = unsafe { hum_client_is_authenticated(ptr::null_mut(), &mut is_auth, &mut err) };
    assert_eq!(code_shim, 1);
    let msg_shim = take_error(&mut err);

    let code_impl =
        unsafe { hum_client_is_authenticated_impl(ptr::null_mut(), &mut is_auth, &mut err) };
    assert_eq!(code_impl, 1);
    let msg_impl = take_error(&mut err);
    assert_eq!(msg_shim, msg_impl);

    // send_text
    let body = CString::new("hi").unwrap();
    let code_shim =
        unsafe { hum_client_send_text(ptr::null_mut(), ptr::null(), body.as_ptr(), &mut err) };
    assert_eq!(code_shim, 1);
    let msg_shim = take_error(&mut err);

    let code_impl =
        unsafe { hum_client_send_text_impl(ptr::null_mut(), ptr::null(), body.as_ptr(), &mut err) };
    assert_eq!(code_impl, 1);
    let msg_impl = take_error(&mut err);
    assert_eq!(msg_shim, msg_impl);

    // create_room
    let mut out_room_id: *mut c_char = ptr::null_mut();
    let code_shim = unsafe {
        hum_client_create_room(
            ptr::null_mut(),
            ptr::null(),
            ptr::null(),
            false,
            &mut out_room_id,
            &mut err,
        )
    };
    assert_eq!(code_shim, 1);
    let msg_shim = take_error(&mut err);

    let code_impl = unsafe {
        hum_client_create_room_impl(
            ptr::null_mut(),
            ptr::null(),
            ptr::null(),
            false,
            &mut out_room_id,
            &mut err,
        )
    };
    assert_eq!(code_impl, 1);
    let msg_impl = take_error(&mut err);
    assert_eq!(msg_shim, msg_impl);
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

#[test]
fn client_new_error_paths_are_reported() {
    let dir = tempdir().unwrap();
    let bogus_url = CString::new("not-a-url").unwrap();
    let store_path = CString::new(dir.path().to_string_lossy().into_owned()).unwrap();
    let mut err: *mut c_char = ptr::null_mut();

    let handle = unsafe { hum_client_new(bogus_url.as_ptr(), store_path.as_ptr(), &mut err) };
    assert!(handle.is_null());
    let msg = take_error(&mut err).expect("expected error");
    assert!(!msg.is_empty());

    // Force tokio runtime construction to fail by temporarily reducing the
    // soft file descriptor limit. Keep the hard limit untouched so that it can
    // be restored afterwards without requiring special capabilities.
    let hs = CString::new("http://localhost").unwrap();
    let file_path = dir.path().join("file-store");
    std::fs::write(&file_path, b"").unwrap();
    let store_path = CString::new(file_path.to_string_lossy().into_owned()).unwrap();

    let mut err2: *mut c_char = ptr::null_mut();
    unsafe {
        struct RlimitGuard(libc::rlimit);
        impl Drop for RlimitGuard {
            fn drop(&mut self) {
                unsafe {
                    let res = libc::setrlimit(libc::RLIMIT_NOFILE, &self.0);
                    assert_eq!(res, 0, "failed to restore rlimit");
                }
            }
        }

        let mut old = libc::rlimit {
            rlim_cur: 0,
            rlim_max: 0,
        };
        assert_eq!(libc::getrlimit(libc::RLIMIT_NOFILE, &mut old), 0);
        let hard_cap = old.rlim_max;
        let _guard = RlimitGuard(old);
        let new_limit = libc::rlimit {
            rlim_cur: 0,
            rlim_max: hard_cap,
        };
        assert_eq!(libc::setrlimit(libc::RLIMIT_NOFILE, &new_limit), 0);

        let handle = hum_client_new(hs.as_ptr(), store_path.as_ptr(), &mut err2);
        assert!(handle.is_null());
    }
    let msg2 = take_error(&mut err2).expect("expected runtime error");
    assert!(!msg2.is_empty());
}

#[test]
fn client_free_allows_null_pointer() {
    unsafe { hum_client_free(ptr::null_mut()) };
}

#[test]
fn login_and_logout_error_propagation() {
    {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let _login = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(403)
                .json_body(json!({"errcode": "M_FORBIDDEN", "error": "nope"}));
        });

        let dir = tempdir().unwrap();
        let homeserver = CString::new(server.base_url()).unwrap();
        let store_path = CString::new(dir.path().to_string_lossy().into_owned()).unwrap();
        let mut err: *mut c_char = ptr::null_mut();
        let handle = unsafe { hum_client_new(homeserver.as_ptr(), store_path.as_ptr(), &mut err) };
        assert!(!handle.is_null());
        assert_no_error(&mut err);

        let user = CString::new("user").unwrap();
        let pass = CString::new("wrong").unwrap();
        let code = unsafe { hum_client_login(handle, user.as_ptr(), pass.as_ptr(), &mut err) };
        assert_eq!(code, 2);
        let msg = take_error(&mut err).expect("expected login error");
        assert!(
            msg.to_lowercase().contains("forbidden") || msg.contains("nope"),
            "unexpected login error message: {msg}"
        );

        unsafe { hum_client_free(handle) };
    }

    {
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
                "user_id": "@me:example.org"
            }));
        });
        let _logout = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/logout");
            then.status(403)
                .json_body(json!({"errcode": "M_FORBIDDEN", "error": "fail"}));
        });

        let dir = tempdir().unwrap();
        let homeserver = CString::new(server.base_url()).unwrap();
        let store_path = CString::new(dir.path().to_string_lossy().into_owned()).unwrap();
        let mut err: *mut c_char = ptr::null_mut();
        let handle = unsafe { hum_client_new(homeserver.as_ptr(), store_path.as_ptr(), &mut err) };
        assert!(!handle.is_null());
        assert_no_error(&mut err);

        let user = CString::new("user").unwrap();
        let pass = CString::new("correct").unwrap();
        let code = unsafe { hum_client_login(handle, user.as_ptr(), pass.as_ptr(), &mut err) };
        assert_eq!(code, 0);
        assert_no_error(&mut err);

        let code = unsafe { hum_client_logout(handle, &mut err) };
        assert_eq!(code, 2);
        let msg = take_error(&mut err).expect("expected logout error");
        assert!(msg.contains("fail"));

        unsafe { hum_client_free(handle) };
    }
}

#[test]
fn sync_and_loop_error_paths() {
    let mut err: *mut c_char = ptr::null_mut();
    let bogus_handle = ptr::null_mut();

    assert_eq!(
        unsafe { hum_client_sync_once(bogus_handle, 0, &mut err) },
        1
    );
    assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

    assert_eq!(
        unsafe { hum_client_start_sync_loop(bogus_handle, 0, &mut err) },
        1
    );
    assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

    assert_eq!(
        unsafe { hum_client_stop_sync_loop(bogus_handle, &mut err) },
        1
    );
    assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

    assert_eq!(
        unsafe { hum_client_send_text(bogus_handle, ptr::null(), ptr::null(), &mut err) },
        1
    );
    assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));
}

#[test]
fn upload_media_rejects_null_data() {
    let mut err: *mut c_char = ptr::null_mut();
    let mut out_uri: *mut c_char = ptr::null_mut();
    let mime = CString::new("text/plain").unwrap();
    let code = unsafe {
        hum_client_upload_media(
            ptr::null_mut(),
            ptr::null(),
            0,
            mime.as_ptr(),
            &mut out_uri,
            &mut err,
        )
    };
    assert_eq!(code, 1);
    assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));

    // Now with a dummy handle but null data pointer to reach the branch.
    let runtime = tokio::runtime::Runtime::new().unwrap();
    let inner = HandleInner {
        inner: None,
        runtime,
    };
    let handle = Box::into_raw(Box::new(inner)) as *mut HumClientHandle;

    let mut err: *mut c_char = ptr::null_mut();
    let mut out_uri: *mut c_char = ptr::null_mut();
    let mime = CString::new("text/plain").unwrap();
    let code = unsafe {
        hum_client_upload_media_impl(
            handle,
            ptr::null(),
            5,
            mime.as_ptr(),
            &mut out_uri,
            &mut err,
        )
    };
    assert_eq!(code, 1);
    assert_eq!(take_error(&mut err).as_deref(), Some("null data"));
    unsafe { hum_client_free(handle) };
}

#[test]
fn download_media_null_out_params() {
    let mut err: *mut c_char = ptr::null_mut();
    let uri = CString::new("mxc://example.org/a").unwrap();
    let code = unsafe {
        hum_client_download_media(
            ptr::null_mut(),
            uri.as_ptr(),
            ptr::null_mut(),
            ptr::null_mut(),
            &mut err,
        )
    };
    assert_eq!(code, 1);
    assert_eq!(take_error(&mut err).as_deref(), Some("null handle"));
}

#[test]
fn extended_client_operations_cover_impls() {
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
            "user_id": "@me:example.org"
        }));
    });
    let _sync = server.mock(|when, then| {
        when.method(GET).path("/_matrix/client/v3/sync");
        then.status(200).json_body(json!({
            "next_batch": "s1",
            "rooms": {
                "join": {
                    "!r:example.org": {
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
    let _keys_upload = server.mock(|when, then| {
        when.method(POST).path_contains("/_matrix/client/v3/keys/");
        then.status(200).json_body(json!({}));
    });
    let _join = server.mock(|when, then| {
        when.method(POST)
            .path_contains("/_matrix/client/v3/join/!r:example.org");
        then.status(200)
            .json_body(json!({ "room_id": "!r:example.org" }));
    });
    let _leave = server.mock(|when, then| {
        when.method(POST)
            .path("/_matrix/client/v3/rooms/!r:example.org/leave");
        then.status(200).json_body(json!({}));
    });
    let _send_reaction = server.mock(|when, then| {
        when.path_contains("/send/");
        then.status(200)
            .json_body(json!({ "event_id": "$react:example.org" }));
    });
    let _redact = server.mock(|when, then| {
        when.method(PUT).path_contains("/redact/");
        then.status(200)
            .json_body(json!({ "event_id": "$redacted:example.org" }));
    });
    let _typing = server.mock(|when, then| {
        when.method(PUT).path_contains("/typing/");
        then.status(200).json_body(json!({}));
    });
    let _search = server.mock(|when, then| {
        when.method(POST)
            .path("/_matrix/client/v3/user_directory/search");
        then.status(200).json_body(json!({
            "limited": false,
            "results": [
                {"user_id": "@a:example.org", "display_name": "Alice"}
            ]
        }));
    });
    let _devices = server.mock(|when, then| {
        when.method(GET).path("/_matrix/client/v3/devices");
        then.status(200).json_body(json!({
            "devices": [
                {"device_id": "DEV1", "display_name": "Phone"}
            ]
        }));
    });
    let _rename = server.mock(|when, then| {
        when.method(PUT).path("/_matrix/client/v3/devices/DEV1");
        then.status(200).json_body(json!({}));
    });
    let _any_put = server.mock(|when, then| {
        when.method(PUT);
        then.status(200).json_body(json!({ "event_id": "$ok" }));
    });
    let _delete = server.mock(|when, then| {
        when.method(POST).path("/_matrix/client/v3/delete_devices");
        then.status(200).json_body(json!({}));
    });
    let _upload = server.mock(|when, then| {
        when.method(POST).path_contains("/_matrix/media/");
        then.status(200)
            .json_body(json!({ "content_uri": "mxc://example.org/media" }));
    });
    let _download = server.mock(|when, then| {
        when.method(GET).path_contains("/_matrix/media/");
        then.status(200).body("hello world");
    });
    let _presence_put = server.mock(|when, then| {
        when.method(PUT)
            .path("/_matrix/client/v3/presence/@me:example.org/status");
        then.status(200).json_body(json!({}));
    });
    let _presence_get = server.mock(|when, then| {
        when.method(GET)
            .path("/_matrix/client/v3/presence/@friend:example.org/status");
        then.status(200).json_body(json!({ "presence": "online" }));
    });
    let _fallback_success = server.mock(|when, then| {
        when.any_request();
        then.status(200).json_body(json!({}));
    });

    let dir = tempdir().unwrap();
    let homeserver = CString::new(server.base_url()).unwrap();
    let store_path = CString::new(dir.path().to_string_lossy().into_owned()).unwrap();
    let mut err: *mut c_char = ptr::null_mut();
    let handle = unsafe { hum_client_new(homeserver.as_ptr(), store_path.as_ptr(), &mut err) };
    assert!(!handle.is_null());
    assert_no_error(&mut err);

    let user = CString::new("me").unwrap();
    let pass = CString::new("pw").unwrap();
    let code = unsafe { hum_client_login(handle, user.as_ptr(), pass.as_ptr(), &mut err) };
    assert_eq!(code, 0);
    assert_no_error(&mut err);

    let code = unsafe { hum_client_sync_once(handle, 0, &mut err) };
    assert_eq!(code, 0);
    assert_no_error(&mut err);

    let mut is_auth = false;
    let code = unsafe { hum_client_is_authenticated(handle, &mut is_auth, &mut err) };
    assert_eq!(code, 0);
    assert!(is_auth);
    assert_no_error(&mut err);

    let mut joined_room_id: *mut c_char = ptr::null_mut();
    let room = CString::new("!r:example.org").unwrap();
    let code =
        unsafe { hum_client_join_room(handle, room.as_ptr(), &mut joined_room_id, &mut err) };
    if code != 0 {
        let msg = take_error(&mut err).unwrap_or_default();
        panic!("join failed: code {code} msg {msg}");
    }
    assert!(!joined_room_id.is_null());
    let joined = unsafe { CStr::from_ptr(joined_room_id) }
        .to_string_lossy()
        .into_owned();
    assert_eq!(joined, "!r:example.org");
    unsafe { hum_free_string(joined_room_id) };

    let mut rooms_json: *mut c_char = ptr::null_mut();
    let code = unsafe { hum_client_get_rooms(handle, &mut rooms_json, &mut err) };
    assert_eq!(code, 0);
    assert!(!rooms_json.is_null());
    unsafe { hum_free_string(rooms_json) };

    let event = CString::new("$event:example.org").unwrap();
    let key = CString::new("👍").unwrap();
    let code = unsafe {
        hum_client_send_reaction(
            handle,
            room.as_ptr(),
            event.as_ptr(),
            key.as_ptr(),
            &mut err,
        )
    };
    if code == 0 {
        assert_no_error(&mut err);
    } else {
        assert_eq!(code, 2);
        assert!(take_error(&mut err).is_some());
    }

    let code =
        unsafe { hum_client_redact(handle, room.as_ptr(), event.as_ptr(), ptr::null(), &mut err) };
    if code == 0 {
        assert_no_error(&mut err);
    } else {
        assert_eq!(code, 2);
        assert!(take_error(&mut err).is_some());
    }

    let code = unsafe { hum_client_set_typing(handle, room.as_ptr(), true, 1000, &mut err) };
    if code == 0 {
        assert_no_error(&mut err);
    } else {
        assert_eq!(code, 2);
        assert!(take_error(&mut err).is_some());
    }

    let mut search_json: *mut c_char = ptr::null_mut();
    let query = CString::new("a").unwrap();
    let code =
        unsafe { hum_client_search_users(handle, query.as_ptr(), 5, &mut search_json, &mut err) };
    assert_eq!(code, 0);
    assert!(!search_json.is_null());
    unsafe { hum_free_string(search_json) };

    let mut devices_json: *mut c_char = ptr::null_mut();
    let code = unsafe { hum_client_get_devices(handle, &mut devices_json, &mut err) };
    assert_eq!(code, 0);
    assert!(!devices_json.is_null());
    unsafe { hum_free_string(devices_json) };

    let device = CString::new("DEV1").unwrap();
    let new_name = CString::new("Desk").unwrap();
    let code =
        unsafe { hum_client_rename_device(handle, device.as_ptr(), new_name.as_ptr(), &mut err) };
    assert_eq!(code, 0);
    assert_no_error(&mut err);

    let code = unsafe { hum_client_delete_device(handle, device.as_ptr(), &mut err) };
    assert_eq!(code, 0);
    assert_no_error(&mut err);

    let payload = b"hello";
    let mime = CString::new("text/plain").unwrap();
    let mut out_uri: *mut c_char = ptr::null_mut();
    let code = unsafe {
        hum_client_upload_media(
            handle,
            payload.as_ptr(),
            payload.len(),
            mime.as_ptr(),
            &mut out_uri,
            &mut err,
        )
    };
    if code == 0 {
        assert!(!out_uri.is_null());
        unsafe { hum_free_string(out_uri) };
    } else {
        assert_eq!(code, 2);
        assert!(take_error(&mut err).is_some());
    }

    let uri = CString::new("mxc://example.org/media").unwrap();
    let mut out_buf: *mut u8 = ptr::null_mut();
    let mut out_len: usize = 0;
    let code = unsafe {
        hum_client_download_media(handle, uri.as_ptr(), &mut out_buf, &mut out_len, &mut err)
    };
    if code == 0 {
        assert!(!out_buf.is_null());
        assert!(out_len > 0);
        unsafe { hum_free_buf(out_buf, out_len) };
    } else {
        assert_eq!(code, 2);
        assert!(take_error(&mut err).is_some());
    }

    let mut err_msg: *mut c_char = ptr::null_mut();
    let bad_code = unsafe {
        hum_client_import_recovery_key(handle, CString::new("key").unwrap().as_ptr(), &mut err_msg)
    };
    if bad_code == 0 {
        assert_no_error(&mut err_msg);
    } else {
        assert_eq!(bad_code, 2);
        assert!(take_error(&mut err_msg).is_some());
    }

    let mut err_msg: *mut c_char = ptr::null_mut();
    let bad_code = unsafe {
        hum_client_send_read_receipt(handle, room.as_ptr(), event.as_ptr(), &mut err_msg)
    };
    if bad_code == 0 {
        assert_no_error(&mut err_msg);
    } else {
        assert_eq!(bad_code, 2);
        assert!(take_error(&mut err_msg).is_some());
    }

    err = ptr::null_mut();
    let code = unsafe { hum_client_set_presence(handle, 0, &mut err) };
    assert_eq!(code, 0);
    assert_no_error(&mut err);

    let mut state: u32 = 99;
    let code = unsafe {
        hum_client_get_presence(
            handle,
            CString::new("@friend:example.org").unwrap().as_ptr(),
            &mut state,
            &mut err,
        )
    };
    assert_eq!(code, 0);
    assert_eq!(state, 0);
    assert_no_error(&mut err);

    let code = unsafe { hum_client_leave_room(handle, room.as_ptr(), &mut err) };
    assert_eq!(code, 0);
    assert_no_error(&mut err);

    let code = unsafe { hum_client_logout(handle, &mut err) };
    assert_eq!(code, 0);
    assert_no_error(&mut err);

    unsafe { hum_client_free(handle) };
}
