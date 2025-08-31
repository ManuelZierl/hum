use std::{env, path::PathBuf};

use anyhow::Error;
use hum_matrix_core::{HumClient, Result, config::ClientConfig};

#[tokio::main]
async fn main() -> Result<()> {
    let homeserver = env::var("MATRIX_HS").unwrap_or_else(|_| "https://matrix.org".to_owned());
    let username = env::var("MATRIX_USER").expect("MATRIX_USER must be set");
    let password = env::var("MATRIX_PASS").expect("MATRIX_PASS must be set");
    let store_path = env::var("MATRIX_STORE").unwrap_or_else(|_| "hum_store".into());
    let store_path = PathBuf::from(store_path);
    std::fs::create_dir_all(&store_path).map_err(Error::from)?;

    let cfg = ClientConfig::new(homeserver, store_path);
    let client = HumClient::new(cfg).await?;

    client.login_username(&username, &password).await?;
    client.start_sync_background().await?;
    if let Ok(room) = env::var("MATRIX_ROOM") {
        client.send_text(&room, "Hello from Hum CLI").await?;
    }
    println!("Logged in and syncing. Press Ctrl-C to exit.");

    tokio::signal::ctrl_c().await.map_err(Error::from)?;
    Ok(())
}
