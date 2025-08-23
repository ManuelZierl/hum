use std::{fs, path::PathBuf, time::Duration};

use anyhow::{anyhow, Result};
use clap::Parser;
use matrix_engine::{Engine, EngineConfig};
use matrix_sdk::ruma::OwnedRoomId;
use tracing_subscriber::{fmt, EnvFilter};

#[derive(Parser, Debug)]
struct Args {
    #[arg(long)]
    homeserver: String,
    #[arg(long)]
    username: Option<String>,
    #[arg(long)]
    password: Option<String>,
    #[arg(long)]
    store: PathBuf,
    /// Send a message to a room id and exit
    #[arg(long, num_args = 2)]
    send: Option<Vec<String>>,
    #[arg(long, default_value_t = 10)]
    duration: u64,
}

#[tokio::main]
async fn main() -> Result<()> {
    fmt().with_env_filter(EnvFilter::from_default_env()).init();

    let args = Args::parse();

    let config = EngineConfig {
        homeserver_url: args.homeserver,
        store_path: args.store.clone(),
        user_agent: Some("mx_demo".to_string()),
    };

    let engine = Engine::new(config).await?;

    let session_file = args.store.join("session.json");
    if session_file.exists() {
        let data = fs::read_to_string(&session_file)?;
        let session: matrix_sdk::Session = serde_json::from_str(&data)?;
        engine.restore_session(session).await?;
        println!("Restored session from {:?}", session_file);
    } else {
        let username = args
            .username
            .as_deref()
            .ok_or_else(|| anyhow!("--username required"))?;
        let password = args
            .password
            .as_deref()
            .ok_or_else(|| anyhow!("--password required"))?;
        let session = engine.login(username, password).await?;
        fs::create_dir_all(&args.store)?;
        fs::write(&session_file, serde_json::to_string(&session)?)?;
        println!("Logged in and stored session to {:?}", session_file);
    }

    engine.print_room_summaries().await?;

    if let Some(send) = args.send {
        if send.len() != 2 {
            return Err(anyhow!("--send requires <room_id> <message>"));
        }
        let room_id: OwnedRoomId = send[0].parse()?;
        engine.send_text(&room_id, &send[1]).await?;
    } else {
        engine.sync_for(Duration::from_secs(args.duration)).await?;
    }

    Ok(())
}
