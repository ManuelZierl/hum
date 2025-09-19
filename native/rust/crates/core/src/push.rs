//! Push notification token registration.
// TODO: do we need this? Or can this be handled by react native?
use crate::{
    client::HumClient,
    error::{HumError, Result},
};

impl HumClient {
    pub async fn register_push_token(&self, _token: &str, _platform: &str) -> Result<()> {
        Err(HumError::Other(
            "register_push_token not implemented".into(),
        ))
    }

    pub async fn unregister_push_token(&self, _token: &str) -> Result<()> {
        Err(HumError::Other(
            "unregister_push_token not implemented".into(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::ClientConfig;
    use httpmock::prelude::*;
    use serde_json::json;
    use tempfile::tempdir;

    async fn build_client() -> HumClient {
        let dir = tempdir().unwrap();
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        HumClient::new(ClientConfig::new(
            server.base_url(),
            dir.path().to_path_buf(),
        ))
        .await
        .unwrap()
    }

    #[tokio::test]
    async fn register_push_token_returns_placeholder_error() {
        let client = build_client().await;
        let err = client
            .register_push_token("token", "ios")
            .await
            .expect_err("register should error");

        match err {
            HumError::Other(msg) => {
                assert_eq!(msg, "register_push_token not implemented");
            }
            other => panic!("unexpected error variant: {other:?}"),
        }
    }

    #[tokio::test]
    async fn unregister_push_token_returns_placeholder_error() {
        let client = build_client().await;
        let err = client
            .unregister_push_token("token")
            .await
            .expect_err("unregister should error");

        match err {
            HumError::Other(msg) => {
                assert_eq!(msg, "unregister_push_token not implemented");
            }
            other => panic!("unexpected error variant: {other:?}"),
        }
    }
}
