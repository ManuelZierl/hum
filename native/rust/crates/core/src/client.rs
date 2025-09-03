//! Client implementation wrapping the Matrix SDK.

use crate::{
    config::ClientConfig,
    error::{HumError, Result},
};
use matrix_sdk::{Client, encryption::verification::VerificationRequest};

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

    /// Request verification for the current device.
    ///
    /// This will initiate a verification flow with another of the user's
    /// devices so that the current device can be marked as trusted.
    pub async fn request_verification(&self) -> Result<VerificationRequest> {
        let user_id = self
            .client
            .user_id()
            .ok_or_else(|| HumError::Other("missing user id".into()))?;
        let device_id = self
            .client
            .device_id()
            .ok_or_else(|| HumError::Other("missing device id".into()))?;

        let devices = self
            .client
            .encryption()
            .get_user_devices(user_id)
            .await?;

        let Some(device) = devices
            .devices()
            .find(|d| d.device_id() != device_id && d.is_verified())
        else {
            return Err(HumError::Other("no verified device available".into()));
        };

        let request = device.request_verification().await?;
        Ok(request)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[tokio::test]
    #[ignore]
    async fn create_client() {
        let dir = tempdir().unwrap();
        let cfg = ClientConfig::new("https://example.com".into(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        assert!(
            client
                .inner()
                .homeserver()
                .to_string()
                .contains("example.com")
        );
    }
}
