//! Client configuration for the Hum Matrix client.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

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
