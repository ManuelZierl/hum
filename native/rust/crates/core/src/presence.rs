//! Presence APIs.

use crate::{
    client::HumClient,
    error::{HumError, Result},
};
use matrix_sdk::ruma::api::client::presence::{get_presence, set_presence};
use matrix_sdk::ruma::presence::PresenceState as RumaPresence;

/// Presence states.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PresenceState {
    Online,
    Idle,
    DoNotDisturb,
    Invisible,
}

impl HumClient {
    /// Set presence for the current user.
    pub async fn set_presence(&self, state: PresenceState) -> Result<()> {
        let uid = self
            .client
            .user_id()
            .ok_or_else(|| HumError::Other("not authenticated".into()))?
            .to_owned();
        let presence = match state {
            PresenceState::Online => RumaPresence::Online,
            PresenceState::Idle | PresenceState::DoNotDisturb => RumaPresence::Unavailable,
            PresenceState::Invisible => RumaPresence::Offline,
        };
        let req = set_presence::v3::Request::new(uid, presence);
        // No status message for now
        self.client.send(req).await?;
        Ok(())
    }

    /// Get presence of a user.
    pub async fn get_presence(&self, user_id: &str) -> Result<PresenceState> {
        let uid: matrix_sdk::ruma::OwnedUserId = user_id.parse()?;
        let req = get_presence::v3::Request::new(uid);
        let resp = self.client.send(req).await?;
        let state = match resp.presence {
            RumaPresence::Online => PresenceState::Online,
            RumaPresence::Unavailable => PresenceState::Idle,
            RumaPresence::Offline => PresenceState::Invisible,
            _ => PresenceState::Invisible,
        };
        Ok(state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use serde_json::json;
    use tempfile::tempdir;

    #[tokio::test]
    async fn set_and_get_presence() {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let _login = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEVICE",
                "user_id": "@me:example.org"
            }));
        });
        let put_presence = server.mock(|when, then| {
            when.method(PUT)
                .path("/_matrix/client/v3/presence/@me:example.org/status");
            then.status(200).json_body(json!({}));
        });
        let get_presence = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/presence/@a:example.org/status");
            then.status(200).json_body(json!({"presence": "online"}));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("me", "pw").await.unwrap();
        client.set_presence(PresenceState::Online).await.unwrap();
        let p = client.get_presence("@a:example.org").await.unwrap();
        assert_eq!(p, PresenceState::Online);
        put_presence.assert();
        get_presence.assert();
    }
}
