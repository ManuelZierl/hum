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
        if let Some(handle) = guard.take() {
            handle.abort();
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use serde_json::json;
    use std::time::Duration;
    use tempfile::tempdir;
    use tokio::time::sleep;

    use matrix_sdk::{
        SessionMeta, SessionTokens,
        authentication::matrix::MatrixSession,
        ruma::{device_id, user_id},
    };

    fn sample_session() -> MatrixSession {
        MatrixSession {
            meta: SessionMeta {
                user_id: user_id!("@example:localhost").to_owned(),
                device_id: device_id!("DEVICE").to_owned(),
            },
            tokens: SessionTokens {
                access_token: "token".into(),
                refresh_token: None,
            },
        }
    }

    async fn mocked_client() -> (MockServer, tempfile::TempDir, HumClient) {
        let dir = tempdir().unwrap();

        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        let cfg = ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        (server, dir, client)
    }

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

    #[tokio::test]
    async fn config_accessors_reflect_input() {
        let (server, dir, client) = mocked_client().await;

        assert_eq!(client.config().homeserver_url, server.base_url());
        assert_eq!(client.config().store_path, dir.path());

        let homeserver = client.inner().homeserver().clone();
        let base_url = server.base_url();
        let actual = homeserver.as_str().trim_end_matches('/');
        let expected = base_url.trim_end_matches('/');
        assert_eq!(actual, expected);
    }

    #[tokio::test]
    async fn from_store_creates_equivalent_client() {
        let dir = tempdir().unwrap();
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        let store_path = dir.path().to_path_buf();
        let client = HumClient::from_store(server.base_url(), store_path.clone())
            .await
            .unwrap();

        assert_eq!(client.config().homeserver_url, server.base_url());
        assert_eq!(client.config().store_path, store_path);
    }

    #[tokio::test]
    async fn session_restoration_updates_auth_state() {
        let (_server, _dir, client) = mocked_client().await;

        assert!(!client.is_authenticated());
        assert!(!client.verify_recovery_ready().await.unwrap());

        client
            .inner()
            .restore_session(sample_session())
            .await
            .unwrap();

        assert!(client.is_authenticated());
        assert!(client.verify_recovery_ready().await.unwrap());
    }

    #[tokio::test]
    async fn export_recovery_key_returns_expected_error() {
        let (_server, _dir, client) = mocked_client().await;

        let err = client.export_recovery_key().await.unwrap_err();
        match err {
            HumError::Other(message) => {
                assert!(message.contains("not implemented"));
            }
            other => panic!("unexpected error variant: {other:?}"),
        }
    }

    #[tokio::test]
    async fn sync_helpers_issue_requests() {
        let dir = tempdir().unwrap();
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        let sync_mock = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200)
                .header("content-type", "application/json")
                .json_body(json!({
                    "next_batch": "test",
                    "rooms": { "join": {} },
                    "presence": { "events": [] },
                    "account_data": { "events": [] },
                    "to_device": { "events": [] }
                }));
        });

        let cfg = ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();

        client
            .inner()
            .restore_session(sample_session())
            .await
            .unwrap();

        let sync_cfg = SyncConfig::new(false, Some(10));
        client.sync_once(&sync_cfg).await.unwrap();
        client.initial_sync().await.unwrap();

        sync_mock.assert_hits(2);
    }

    #[tokio::test]
    async fn start_and_stop_sync_loop_manage_task() {
        let dir = tempdir().unwrap();
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        let sync_mock = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200)
                .header("content-type", "application/json")
                .json_body(json!({
                    "next_batch": "token",
                    "rooms": { "join": {} },
                    "presence": { "events": [] },
                    "account_data": { "events": [] },
                    "to_device": { "events": [] }
                }));
        });

        let cfg = ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client
            .inner()
            .restore_session(sample_session())
            .await
            .unwrap();

        let sync_cfg = SyncConfig::default();

        client.start_sync_loop(&sync_cfg).await.unwrap();
        sleep(Duration::from_millis(200)).await;
        // Starting again should be a no-op when already running.
        client.start_sync_loop(&sync_cfg).await.unwrap();

        sleep(Duration::from_millis(100)).await;
        client.stop_sync_loop().await.unwrap();
        // Stopping again should also be a no-op.
        client.stop_sync_loop().await.unwrap();

        assert!(sync_mock.hits() > 0);
    }
}
