//! Recovery and crypto helpers.

use crate::{client::HumClient, error::Result};

impl HumClient {
    /// Ensure E2EE is ready (placeholder: calls `verify_recovery_ready`).
    pub async fn ensure_e2ee_ready(&self) -> Result<bool> {
        self.verify_recovery_ready().await
    }
}
