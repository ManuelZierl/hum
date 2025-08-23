use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Configuration parameters for the Matrix client.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ClientConfig {
    /// Base URL of the homeserver.
    pub homeserver_url: String,
    /// User agent string for network requests.
    pub user_agent: String,
    /// Path where stores should persist data.
    pub store_path: PathBuf,
    /// Feature flags that can toggle functionality.
    #[serde(default)]
    pub feature_flags: HashMap<String, bool>,
}
