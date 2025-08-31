use std::env;

use hum_matrix_core::{HumClient, Result, config::ClientConfig};

#[tokio::main]
async fn main() -> Result<()> {
    let homeserver = env::var("MATRIX_HS").unwrap_or_else(|_| "https://matrix.org".to_owned());
    let username = env::var("MATRIX_USER").expect("MATRIX_USER must be set");
    let password = env::var("MATRIX_PASS").expect("MATRIX_PASS must be set");

    let store_path = env::temp_dir().join("hum_cli");
    std::fs::create_dir_all(&store_path).expect("failed to create store dir");
    let cfg = ClientConfig::new(homeserver, store_path);
    let client = HumClient::new(cfg).await?;

    client.login(&username, &password).await?;
    client.start_sync(false).await?;
    println!("Logged in and syncing. Press Ctrl-C to exit.");

    tokio::signal::ctrl_c()
        .await
        .expect("failed to listen for ctrl_c");
    client.logout().await.ok();
    println!("Shutdown complete.");
    Ok(())
}
