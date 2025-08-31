//! Synchronisation related helpers.

use crate::{client::HumClient, error::Result};

impl HumClient {
    /// Start the sync loop. When `sliding` is `true`, experimental sliding
    /// sync will be used.
    pub async fn start_sync(&self, sliding: bool) -> Result<()> {
        let _ = sliding;
        Ok(())
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
        client.start_sync(true).await.unwrap();
    }
}
