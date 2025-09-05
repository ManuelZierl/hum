use hum_matrix_ffi::init;
use tempfile::tempdir;

#[test]
#[ignore]
fn client_smoke() {
    let dir = tempdir().unwrap();
    let store = dir.path().to_str().unwrap().to_string();
    let client = init("https://matrix.org".into(), store).unwrap();
    client.login("user".into(), "pass".into()).unwrap_err();
    client.start_sync(false).unwrap();
    client
        .send_text("!room:server".into(), "hi".into())
        .unwrap_err();
}
