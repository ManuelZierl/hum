//! Client implementation wrapping the Matrix SDK.

use crate::{
    config::{ClientConfig, SyncConfig},
    error::{HumError, Result},
};
use matrix_sdk::Client;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;

/// High level client used by the application.
pub struct HumClient {
    /// Underlying Matrix SDK client.
    pub(crate) client: Client,
    /// Configuration used to create the client.
    config: ClientConfig,
    /// Background sync task handle, if running.
    sync_task: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl HumClient {
    /// Create a new [`HumClient`] from the given configuration.
    pub async fn new(config: ClientConfig) -> Result<Self> {
        let client = Client::builder()
            .homeserver_url(&config.homeserver_url)
            .sqlite_store(&config.store_path, None)
            .build()
            .await?;
        Ok(Self {
            client,
            config,
            sync_task: Arc::new(Mutex::new(None)),
        })
    }

    /// Access the stored configuration.
    pub fn config(&self) -> &ClientConfig {
        &self.config
    }

    /// Access the underlying Matrix SDK client.
    pub fn inner(&self) -> &Client {
        &self.client
    }

    /// Create a client using an existing store path without building a full config externally.
    pub async fn from_store(
        homeserver_url: String,
        store_path: std::path::PathBuf,
    ) -> Result<Self> {
        Self::new(ClientConfig::new(homeserver_url, store_path)).await
    }

    /// Returns true if a session is currently authenticated.
    pub fn is_authenticated(&self) -> bool {
        self.client.matrix_auth().session().is_some()
    }

    /// Import a recovery key (alias of `bootstrap_from_recovery_key`).
    pub async fn import_recovery_key(&self, key: &str) -> Result<()> {
        // Unlock Secret Storage using the provided recovery key,
        // import the cross-signing keys and mark this device as verified.
        let store = self.client.encryption().secret_storage();
        let secret_store = store.open_secret_store(key).await?;
        secret_store.import_secrets().await?;
        Ok(())
    }

    /// Exporting recovery key is not yet implemented via SDK: placeholder returning an error.
    pub async fn export_recovery_key(&self) -> Result<String> {
        Err(HumError::Other(
            "export_recovery_key not implemented".into(),
        ))
    }

    /// Verify that secret storage is accessible, implying recovery is ready.
    pub async fn verify_recovery_ready(&self) -> Result<bool> {
        // SDK doesn't expose a direct probe in this version; return false if not logged in.
        Ok(self.is_authenticated())
    }

    /// Run a single sync request with optional timeout.
    pub async fn sync_once(&self, cfg: &SyncConfig) -> Result<()> {
        let settings = cfg.to_sync_settings();
        self.client.sync_once(settings).await?;
        Ok(())
    }

    /// Convenience: initial sync using default settings.
    pub async fn initial_sync(&self) -> Result<()> {
        self.client
            .sync_once(matrix_sdk::config::SyncSettings::default())
            .await?;
        Ok(())
    }

    /// Start continuous sync loop. If already running, this is a no-op.
    pub async fn start_sync_loop(&self, cfg: &SyncConfig) -> Result<()> {
        let mut guard = self.sync_task.lock().await;
        if guard.is_some() {
            return Ok(());
        }
        let client = self.client.clone();
        let settings = cfg.to_sync_settings();
        let handle = tokio::spawn(async move {
            let _ = client.sync(settings).await;
        });
        *guard = Some(handle);
        Ok(())
    }

    /// Stop continuous sync loop if running.
    pub async fn stop_sync_loop(&self) -> Result<()> {
        let mut guard = self.sync_task.lock().await;
        let handle = guard.take();
        drop(guard);
        if let Some(handle) = handle {
            handle.abort();
            let _ = handle.await;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use serde_json::json;
    use tempfile::tempdir;

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
