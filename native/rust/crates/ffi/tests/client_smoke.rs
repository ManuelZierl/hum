use hum_matrix_ffi::init;

#[test]
fn client_smoke() {
    let client = init("https://matrix.org".into(), "/tmp".into());
    client.login("user".into(), "pass".into());
    client.start_sync(false);
    client.send_text("!room:server".into(), "hi".into());
}
