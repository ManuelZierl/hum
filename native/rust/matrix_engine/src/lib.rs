use std::{path::PathBuf, time::Duration};

use anyhow::{Context, Result};
use futures_util::StreamExt;
use matrix_sdk::{
    config::SyncSettings,
    ruma::{
        events::room::message::{
            MessageType, OriginalSyncRoomMessageEvent, RoomMessageEventContent,
        },
        OwnedRoomId, RoomId,
    },
    Client, Session,
};
use serde::{Deserialize, Serialize};
use tokio::time::Instant;
use tracing::debug;
use url::Url;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EngineConfig {
    pub homeserver_url: String,
    pub store_path: PathBuf,
    pub user_agent: Option<String>,
}

pub struct Engine {
    client: Client,
}

impl Engine {
    pub async fn new(config: EngineConfig) -> Result<Self> {
        let homeserver = Url::parse(&config.homeserver_url)?;
        let mut builder = Client::builder().homeserver_url(homeserver);
        builder = builder.sqlite_store(&config.store_path, None)?;
        if let Some(ua) = config.user_agent {
            builder = builder.user_agent(ua);
        }
        let client = builder.build().await?;

        // Log basic room message events
        client.add_event_handler(
            |ev: OriginalSyncRoomMessageEvent, room: matrix_sdk::room::Room| async move {
                let body = match &ev.content.msgtype {
                    MessageType::Text(text) => text.body.clone(),
                    _ => format!("{:?}", ev.content.msgtype),
                };
                let body = if body.len() > 80 {
                    format!("{}...", &body[..80])
                } else {
                    body
                };
                println!("event {} in {}: {}", ev.sender, room.room_id(), body);
            },
        );

        Ok(Self { client })
    }

    pub fn client(&self) -> Client {
        self.client.clone()
    }

    pub async fn login(&self, username: &str, password: &str) -> Result<Session> {
        debug!("logging in as {}", username);
        let session = self
            .client
            .matrix_auth()
            .login_username(username, password)
            .initial_device_display_name("mx_demo")
            .send()
            .await?;
        Ok(session)
    }

    pub async fn restore_session(&self, session: Session) -> Result<()> {
        self.client.restore_session(session).await?;
        Ok(())
    }

    pub async fn print_room_summaries(&self) -> Result<()> {
        for room in self.client.rooms() {
            let name = room
                .display_name()
                .await
                .unwrap_or_else(|_| room.room_id().to_string());
            // Best effort timestamp
            let ts = room
                .latest_event()
                .ok()
                .and_then(|ev| ev.origin_server_ts())
                .map(|ts| ts.to_string())
                .unwrap_or_else(|| "unknown".to_owned());
            summaries.push(RoomSummary {
                name,
                last_event: ts,
            });
        }
        Ok(summaries)
    }

    pub async fn sync_for(&self, duration: Duration) -> Result<()> {
        let settings = SyncSettings::default();
        let mut stream = self.client.sync_stream(settings);
        let deadline = Instant::now() + duration;
        while let Some(res) = stream.next().await {
            res?;
            if Instant::now() >= deadline {
                break;
            }
        }
        Ok(())
    }

    pub async fn send_text(&self, room_id: &RoomId, body: &str) -> Result<()> {
        let room = self
            .client
            .get_joined_room(room_id)
            .context("Not joined to room")?;
        room.send(RoomMessageEventContent::text_plain(body), None)
            .await?;
        Ok(())
    }
}
