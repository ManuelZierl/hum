use std::env;

use anyhow::Result;
use hum_matrix_core::{HumClient, config::ClientConfig};
use tempfile::tempdir;

#[tokio::test]
#[ignore]
async fn e2e_send_message() -> Result<()> {
    let username = match env::var("MATRIX_USERNAME") {
        Ok(v) => v,
        Err(_) => return Ok(()),
    };
    let password = match env::var("MATRIX_PASSWORD") {
        Ok(v) => v,
        Err(_) => return Ok(()),
    };
    let room_id_str = match env::var("MATRIX_ROOM") {
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

    // Send a message via the wrapper API.
    client
        .send_text(&room_id_str, "hello from hum e2e tests")
        .await?;

    Ok(())
}
