//! Client implementation wrapping the Matrix SDK.

use crate::{config::ClientConfig, error::Result};
use matrix_sdk::Client;

/// High level client used by the application.
pub struct HumClient {
    /// Underlying Matrix client. `None` in stub implementation.
    client: Option<Client>,
    /// Configuration used to create the client.
    config: ClientConfig,
}

impl HumClient {
    /// Create a new [`HumClient`] from the given configuration.
    pub async fn new(config: ClientConfig) -> Result<Self> {
        Ok(Self {
            client: None,
            config,
        })
    }

    /// Access the stored configuration.
    pub fn config(&self) -> &ClientConfig {
        &self.config
    }

    /// Access the underlying Matrix SDK client, if any.
    pub fn inner(&self) -> Option<&Client> {
        self.client.as_ref()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn create_client() {
        let dir = tempdir().unwrap();
        let cfg = ClientConfig::new("https://example.com".into(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        assert!(client.inner().is_none());
    }
}
