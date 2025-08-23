use serde::{Deserialize, Serialize};

/// User session credentials stored locally.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Session {
    /// The user's Matrix ID.
    pub user_id: String,
    /// The device ID used for this session.
    pub device_id: String,
    /// Access token placeholder. Network layer is responsible for refreshing.
    pub access_token: Option<String>,
}
