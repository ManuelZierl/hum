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

    #[tokio::test]
    #[ignore]
    async fn login_logout() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap_err();
        // logout without active session still returns error
        client.logout().await.unwrap_err();
    }
}
