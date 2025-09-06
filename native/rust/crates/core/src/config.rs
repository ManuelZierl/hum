//! Client configuration for the Hum Matrix client.

use serde::{Deserialize, Serialize};
use std::{path::PathBuf, time::Duration};

/// Configuration used to create a [`HumClient`](crate::client::HumClient).
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ClientConfig {
    /// URL of the homeserver to connect to.
    pub homeserver_url: String,
    /// Path to store persistent client data.
    pub store_path: PathBuf,
}

impl ClientConfig {
    /// Create a new [`ClientConfig`].
    pub fn new(homeserver_url: String, store_path: PathBuf) -> Self {
        Self {
            homeserver_url,
            store_path,
        }
    }
}

/// Configuration for sync behavior.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct SyncConfig {
    /// Whether to use sliding sync semantics (if supported). Placeholder for future integration.
    pub sliding: bool,
    /// Optional timeout in milliseconds for long-polling syncs.
    pub timeout_ms: Option<u64>,
}

impl SyncConfig {
    pub fn new(sliding: bool, timeout_ms: Option<u64>) -> Self {
        Self {
            sliding,
            timeout_ms,
        }
    }

    /// Convert to Matrix SDK `SyncSettings` with timeout if provided.
    pub fn to_sync_settings(&self) -> matrix_sdk::config::SyncSettings {
        let mut s = matrix_sdk::config::SyncSettings::default();
        if let Some(ms) = self.timeout_ms {
            s = s.timeout(Duration::from_millis(ms));
        }
        s
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn build_config() {
        let dir = tempdir().unwrap();
        let cfg = ClientConfig::new("https://example.com".into(), dir.path().to_path_buf());
        assert_eq!(cfg.homeserver_url, "https://example.com");
        assert_eq!(cfg.store_path, dir.path());
        // ensure serialization roundtrip works
        let json = serde_json::to_string(&cfg).unwrap();
        let de: ClientConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(de.homeserver_url, cfg.homeserver_url);
    }
}
