//! Client implementation wrapping the Matrix SDK.

use crate::{config::ClientConfig, error::Result};
use matrix_sdk::Client;

/// High level client used by the application.
pub struct HumClient {
    /// Underlying Matrix SDK client.
    pub(crate) client: Client,
    /// Configuration used to create the client.
    config: ClientConfig,
}

impl HumClient {
    /// Create a new [`HumClient`] from the given configuration.
    pub async fn new(config: ClientConfig) -> Result<Self> {
        let client = Client::builder()
            .homeserver_url(&config.homeserver_url)
            .sqlite_store(&config.store_path, None)
            .build()
            .await?;
        Ok(Self { client, config })
    }

    /// Access the stored configuration.
    pub fn config(&self) -> &ClientConfig {
        &self.config
    }

    /// Access the underlying Matrix SDK client.
    pub fn inner(&self) -> &Client {
        &self.client
    }

    /// Bootstrap the current device from a recovery key.
    ///
    /// This unlocks Secret Storage using the provided recovery key,
    /// imports the cross-signing keys and marks this device as verified.
    pub async fn bootstrap_from_recovery_key(&self, key: &str) -> Result<()> {
        let store = self.client.encryption().secret_storage();
        let secret_store = store.open_secret_store(key).await?;
        secret_store.import_secrets().await?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use httpmock::prelude::*;
    use serde_json::json;

    #[tokio::test]
    async fn create_client() {
        let dir = tempdir().unwrap();

        // Mock versions so the client can initialize without internet.
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        let cfg = ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        assert!(
            client
                .inner()
                .homeserver()
                .to_string()
                .contains(&server.base_url())
        );
        // Some SDK versions may not call /versions on build; skip strict assertion.
    }
}
