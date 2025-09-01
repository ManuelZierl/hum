//! Device verification helpers for the Hum client.

use matrix_sdk::{Error as MatrixError, encryption::verification::SasVerification};

use crate::{client::HumClient, error::Result};

impl HumClient {
    /// Request verification for the currently logged in device.
    ///
    /// If the client has not been initialised or the device is already
    /// verified, `Ok(None)` will be returned. Otherwise an interactive SAS
    /// verification flow is started and the `SasVerification` object is
    /// returned so the caller can drive the verification to completion.
    pub async fn verify_own_device(&self) -> Result<Option<SasVerification>> {
        let Some(client) = self.inner() else {
            return Ok(None);
        };

        let device = client
            .encryption()
            .get_own_device()
            .await
            .map_err(MatrixError::from)?;

        let Some(device) = device else {
            return Ok(None);
        };

        if device.is_verified() {
            return Ok(None);
        }

        let request = device.request_verification().await?;
        let sas = request.start_sas().await?;
        Ok(sas)
    }
}
