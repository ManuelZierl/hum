use std::env;

use anyhow::Result;
use matrix_sdk::{Client, config::SyncSettings};
use tempfile::tempdir;

#[tokio::test]
#[ignore]
async fn e2e_login_sync() -> Result<()> {
    let username = match env::var("MATRIX_USERNAME") {
        Ok(v) => v,
        Err(_) => return Ok(()),
    };
    let password = match env::var("MATRIX_PASSWORD") {
        Ok(v) => v,
        Err(_) => return Ok(()),
    };
    let homeserver =
        env::var("MATRIX_HOMESERVER").unwrap_or_else(|_| "https://matrix.org".to_owned());

    let dir = tempdir()?;
    let client = Client::builder()
        .homeserver_url(homeserver)
        .sqlite_store(dir.path(), None)
        .build()
        .await?;

    client
        .matrix_auth()
        .login_username(&username, &password)
        .initial_device_display_name("hum-tests")
        .send()
        .await?;
    assert!(client.session().is_some());

    client.sync_once(SyncSettings::default()).await?;

    Ok(())
}
