//! Synchronisation related helpers.

use crate::{client::HumClient, config::SyncConfig, error::Result};

impl HumClient {
    /// Start the sync loop in a background task.
    pub async fn start_sync_background(&self) -> Result<()> {
        // Reuse the tracked sync loop so shutdown paths can abort gracefully.
        self.start_sync_loop(&SyncConfig::default()).await
    }

    /// Compatibility wrapper retaining the previous API.
    pub async fn start_sync(&self, _sliding: bool) -> Result<()> {
        self.start_sync_background().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn start_sync_stub() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();
        client.start_sync_background().await.unwrap();
    }
}
