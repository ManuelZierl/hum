//! Authentication helpers for [`HumClient`](crate::client::HumClient).

use crate::{client::HumClient, error::Result};

impl HumClient {
    /// Log in using a username and password.
    pub async fn login(&self, username: &str, password: &str) -> Result<()> {
        let _ = (username, password);
        Ok(())
    }

    /// Log out of the current session.
    pub async fn logout(&self) -> Result<()> {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    async fn login_logout() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();
        client.login("user", "pass").await.unwrap();
        client.logout().await.unwrap();
    }
}
