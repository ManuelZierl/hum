//! Authentication helpers for [`HumClient`](crate::client::HumClient).

use crate::{client::HumClient, error::Result};

impl HumClient {
    /// Log in using a username and password.
    pub async fn login_username(&self, username: &str, password: &str) -> Result<()> {
        self.client
            .matrix_auth()
            .login_username(username, password)
            .initial_device_display_name("Hum CLI")
            .send()
            .await?;
        Ok(())
    }

    /// Compatibility wrapper retaining previous API name.
    pub async fn login(&self, username: &str, password: &str) -> Result<()> {
        self.login_username(username, password).await
    }

    /// Log out of the current session.
    pub async fn logout(&self) -> Result<()> {
        self.client.matrix_auth().logout().await?;
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
    async fn logout_without_session_returns_err() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();
        // Without a prior login, logout should fail immediately (no network).
        assert!(client.logout().await.is_err());
    }

    #[tokio::test]
    async fn login_username_and_logout_success() {
        // Mock Matrix endpoints
        let server = MockServer::start();
        // versions endpoint queried during client build
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        // login endpoint
        let login_mock = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEVICE",
                "user_id": "@user:example.org"
            }));
        });
        // logout endpoint
        let logout_mock = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/logout");
            then.status(200).json_body(json!({}));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();

        client.login_username("user", "pass").await.unwrap();
        client.logout().await.unwrap();

        login_mock.assert();
        logout_mock.assert();
    }

    #[tokio::test]
    async fn login_alias_calls_login_username() {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let login_mock = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEVICE",
                "user_id": "@user:example.org"
            }));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();

        // Uses the compatibility method which delegates to login_username
        client.login("user", "pass").await.unwrap();
        login_mock.assert();
    }
}
