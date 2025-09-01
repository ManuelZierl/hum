use std::{env, io};

use futures_util::StreamExt;
use hum_matrix_core::{HumClient, Result, SasState, config::ClientConfig};

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

    if let Some(sas) = client.verify_own_device().await? {
        sas.accept().await?;
        let mut stream = sas.changes();

        while let Some(state) = stream.next().await {
            match state {
                SasState::KeysExchanged { .. } => {
                    if let Some(emojis) = sas.emoji() {
                        let emoji_string = emojis
                            .iter()
                            .map(|e| format!("{} {}", e.symbol, e.description))
                            .collect::<Vec<_>>()
                            .join(" ");
                        println!("Compare the following emojis:\n{emoji_string}");
                    } else if let Some((a, b, c)) = sas.decimals() {
                        println!("Compare the numbers: {a} {b} {c}");
                    }

                    println!("Do the codes match? (y/N): ");
                    let mut input = String::new();
                    io::stdin()
                        .read_line(&mut input)
                        .expect("failed to read input");
                    if input.trim().eq_ignore_ascii_case("y") {
                        sas.confirm().await?;
                    } else {
                        sas.mismatch().await?;
                        break;
                    }
                }
                SasState::Done { .. } => {
                    println!("Device verified.");
                    break;
                }
                SasState::Cancelled(info) => {
                    println!("Verification cancelled: {}", info.reason());
                    break;
                }
                SasState::Started { .. } | SasState::Accepted { .. } | SasState::Confirmed => (),
            }
        }
    }

    println!("Logged in and syncing. Press Ctrl-C to exit.");

    tokio::signal::ctrl_c()
        .await
        .expect("failed to listen for ctrl_c");
    client.logout().await.ok();
    println!("Shutdown complete.");
    Ok(())
}
