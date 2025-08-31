//! Messaging helpers for the Hum client.

use crate::{client::HumClient, error::Result};

impl HumClient {
    /// Send a text message to the given room.
    pub async fn send_text_message(&self, room_id: &str, body: &str) -> Result<()> {
        let _ = (room_id, body);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn send_message_stub() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();
        client
            .send_text_message("!room:example.com", "hi")
            .await
            .unwrap();
    }
}
