//! Messaging helpers for the Hum client.

use crate::{client::HumClient, error::Result};
use anyhow::anyhow;
use matrix_sdk::ruma::{OwnedRoomId, events::room::message::RoomMessageEventContent};

impl HumClient {
    /// Send a text message to the given room.
    pub async fn send_text(&self, room_id: &str, body: &str) -> Result<()> {
        let room_id: OwnedRoomId = room_id.parse()?;
        let room = self
            .client
            .get_room(&room_id)
            .ok_or_else(|| anyhow!("room not found"))?;
        let content = RoomMessageEventContent::text_plain(body);
        room.send(content).await?;
        Ok(())
    }

    /// Compatibility wrapper retaining previous API name.
    pub async fn send_text_message(&self, room_id: &str, body: &str) -> Result<()> {
        self.send_text(room_id, body).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    #[ignore]
    async fn send_message_stub() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();
        client
            .send_text("!room:example.com", "hi")
            .await
            .unwrap_err();
    }
}
