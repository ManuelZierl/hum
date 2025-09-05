use std::env;

use anyhow::Result;
use hum_matrix_core::{HumClient, config::ClientConfig};
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
    let client = HumClient::new(ClientConfig::new(homeserver, dir.path().to_path_buf())).await?;

    client
        .login_username(&username, &password)
        .await?;

    // One-off sync to verify the session works; keep this as an e2e-only check.
    client.start_sync(false).await?;

    Ok(())
}

