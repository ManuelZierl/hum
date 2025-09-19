//! Recovery and crypto helpers.

use crate::{client::HumClient, error::Result};

impl HumClient {
    /// Ensure E2EE is ready (placeholder: calls `verify_recovery_ready`).
    pub async fn ensure_e2ee_ready(&self) -> Result<bool> {
        self.verify_recovery_ready().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::ClientConfig;
    use httpmock::prelude::*;
    use matrix_sdk::{
        SessionMeta,
        authentication::{SessionTokens, matrix::MatrixSession},
        ruma::{device_id, user_id},
    };
    use serde_json::json;
    use tempfile::tempdir;

    async fn client_with_mock_server() -> (HumClient, tempfile::TempDir) {
        let dir = tempdir().unwrap();
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        let cfg = ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();

        (client, dir)
    }

    #[tokio::test]
    async fn ensure_e2ee_ready_false_without_session() {
        let (client, _dir) = client_with_mock_server().await;
        assert!(!client.ensure_e2ee_ready().await.unwrap());
    }

    #[tokio::test]
    async fn ensure_e2ee_ready_true_after_restore() {
        let (client, _dir) = client_with_mock_server().await;

        let session = MatrixSession {
            meta: SessionMeta {
                user_id: user_id!("@user:example.org").to_owned(),
                device_id: device_id!("DEVICE").to_owned(),
            },
            tokens: SessionTokens {
                access_token: "token".to_owned(),
                refresh_token: None,
            },
        };

        client.inner().restore_session(session).await.unwrap();

        assert!(client.ensure_e2ee_ready().await.unwrap());
    }
}
