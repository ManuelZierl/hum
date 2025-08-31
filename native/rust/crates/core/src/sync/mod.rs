//! Synchronisation related helpers.

use crate::{client::HumClient, error::Result};
use matrix_sdk::config::SyncSettings;
use tracing::error;

impl HumClient {
    /// Start the sync loop in a background task.
    pub async fn start_sync_background(&self) -> Result<()> {
        let client = self.client.clone();
        tokio::spawn(async move {
            if let Err(e) = client.sync(SyncSettings::default()).await {
                error!("sync error: {e}");
            }
        });
        Ok(())
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
    #[ignore]
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
