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
