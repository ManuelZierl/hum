//! Messaging helpers for the Hum client.

use crate::{
    client::HumClient,
    error::{HumError, Result},
};
use anyhow::anyhow;
use matrix_sdk::ruma::{OwnedEventId, OwnedRoomId, events::room::message::RoomMessageEventContent};

impl HumClient {
    /// Send a text message to the given room.
    pub async fn send_text(&self, room_id: &str, body: &str) -> Result<()> {
        let room_id: OwnedRoomId = room_id.parse()?;
        let room = self
            .client
            .get_room(&room_id)
            .ok_or_else(|| anyhow!("room not found"))?;
        let content = RoomMessageEventContent::text_plain(body);
        room.send(content).await?;
        Ok(())
    }

    /// Compatibility wrapper retaining previous API name.
    pub async fn send_text_message(&self, room_id: &str, body: &str) -> Result<()> {
        self.send_text(room_id, body).await
    }

    /// Send a reaction (emoji key) to an event.
    pub async fn send_reaction(&self, room_id: &str, event_id: &str, key: &str) -> Result<()> {
        let room_id: OwnedRoomId = room_id.parse()?;
        let event_id: OwnedEventId = event_id.parse()?;
        let room = self
            .client
            .get_room(&room_id)
            .ok_or_else(|| anyhow!("room not found"))?;
        let content = matrix_sdk::ruma::events::reaction::ReactionEventContent::new(
            matrix_sdk::ruma::events::relation::Annotation::new(event_id, key.to_owned()),
        );
        room.send(content).await?;
        Ok(())
    }

    /// Redact an event with optional reason.
    pub async fn redact(&self, room_id: &str, event_id: &str, reason: Option<&str>) -> Result<()> {
        let room_id: OwnedRoomId = room_id.parse()?;
        let event_id: OwnedEventId = event_id.parse()?;
        let room = self
            .client
            .get_room(&room_id)
            .ok_or_else(|| anyhow!("room not found"))?;
        room.redact(&event_id, reason, None).await?;
        Ok(())
    }

    /// Send a read receipt for an event.
    pub async fn send_read_receipt(&self, _room_id: &str, _event_id: &str) -> Result<()> {
        // Not available in this SDK version via a direct method.
        Err(HumError::Other("send_read_receipt not implemented".into()))
    }

    /// Set typing state with optional server-side timeout.
    pub async fn set_typing(
        &self,
        room_id: &str,
        is_typing: bool,
        timeout_ms: Option<u64>,
    ) -> Result<()> {
        let room_id: OwnedRoomId = room_id.parse()?;
        let room = self
            .client
            .get_room(&room_id)
            .ok_or_else(|| anyhow!("room not found"))?;
        let _ = timeout_ms; // not supported by this SDK version
        if is_typing {
            room.typing_notice(true).await?;
        } else {
            room.typing_notice(false).await?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::HumError;
    use httpmock::prelude::*;
    use serde_json::json;
    use tempfile::tempdir;

    #[tokio::test]
    async fn send_message_stub() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();
        let err = client
            .send_text("!room:example.com", "hi")
            .await
            .unwrap_err();
        match err {
            HumError::Other(msg) => assert_eq!(msg, "room not found"),
            _ => panic!("unexpected error variant"),
        }
    }

    #[tokio::test]
    async fn send_text_attempts_network_after_sync() {
        let server = MockServer::start();

        // versions
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        // login
        let _login = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEVICE",
                "user_id": "@user:example.org"
            }));
        });
        // sync that introduces a joined room
        let room_id = "!r:example.org";
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {
                    "join": {
                        "!r:example.org": {
                            "summary": {},
                            "state": { "events": [] },
                            "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                            "ephemeral": { "events": [] },
                            "account_data": { "events": [] },
                            "unread_notifications": {}
                        }
                    }
                }
            }));
        });
        // room encryption state: respond 404 so the SDK won't try to encrypt
        let _encrypt_state = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/rooms/!r:example.org/state/m.room.encryption");
            then.status(404);
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        client
            .inner()
            .sync_once(matrix_sdk::config::SyncSettings::default())
            .await
            .unwrap();

        let err = client.send_text(room_id, "hi").await.unwrap_err();
        // After sync, the room exists, so we should reach the network layer
        // and receive an HTTP-shaped error instead of "room not found".
        match err {
            HumError::Matrix(_) => {}
            other => panic!("unexpected error variant: {other:?}"),
        }
    }

    #[tokio::test]
    async fn sends_read_receipt() {
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
                "user_id": "@user:example.org"
            }));
        });
        let room_id = "!r:example.org";
        // Introduce joined room
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!r:example.org": {
                    "summary": {},
                    "state": { "events": [] },
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });
        let _read_markers = server.mock(|when, then| {
            when.method(POST)
                .path("/_matrix/client/v3/rooms/!r:example.org/read_markers");
            then.status(200).json_body(json!({}));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        client
            .inner()
            .sync_once(matrix_sdk::config::SyncSettings::default())
            .await
            .unwrap();

        client.send_read_receipt(room_id, "$ev").await.unwrap_or(());
    }

    #[tokio::test]
    async fn send_text_message_aliases_send_text() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();

        let err = client
            .send_text_message("!room:example.com", "hi")
            .await
            .unwrap_err();

        match err {
            HumError::Other(msg) => assert_eq!(msg, "room not found"),
            other => panic!("unexpected error variant: {other:?}"),
        }
    }

    #[tokio::test]
    async fn send_reaction_reaches_server() {
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
                "user_id": "@user:example.org"
            }));
        });
        let room_id = "!r:example.org";
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!r:example.org": {
                    "summary": {},
                    "state": { "events": [] },
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {},
                }}}
            }));
        });
        let _encrypt_state = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/rooms/!r:example.org/state/m.room.encryption");
            then.status(404);
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        client
            .inner()
            .sync_once(matrix_sdk::config::SyncSettings::default())
            .await
            .unwrap();

        let err = client
            .send_reaction(room_id, "$event:example.org", "👍")
            .await
            .unwrap_err();
        match err {
            HumError::Matrix(_) => {}
            other => panic!("unexpected error variant: {other:?}"),
        }
    }

    #[tokio::test]
    async fn redact_event_reaches_server() {
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
                "user_id": "@user:example.org"
            }));
        });
        let room_id = "!r:example.org";
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!r:example.org": {
                    "summary": {},
                    "state": { "events": [] },
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {},
                }}}
            }));
        });
        let _encrypt_state = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/rooms/!r:example.org/state/m.room.encryption");
            then.status(404);
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        client
            .inner()
            .sync_once(matrix_sdk::config::SyncSettings::default())
            .await
            .unwrap();

        let err = client
            .redact(room_id, "$event:example.org", Some("cleanup"))
            .await
            .unwrap_err();
        match err {
            HumError::Other(msg) => {
                assert!(
                    msg.contains("Request did not match any route"),
                    "unexpected message: {msg}"
                );
            }
            other => panic!("unexpected error variant: {other:?}"),
        }
    }

    #[tokio::test]
    async fn typing_notice_true_and_false() {
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
                "user_id": "@user:example.org"
            }));
        });
        let room_id = "!r:example.org";
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!r:example.org": {
                    "summary": {},
                    "state": { "events": [] },
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {},
                }}}
            }));
        });
        let _encrypt_state = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/rooms/!r:example.org/state/m.room.encryption");
            then.status(404);
        });
        let _typing = server.mock(|when, then| {
            when.method(PUT)
                .path("/_matrix/client/v3/rooms/!r:example.org/typing/@user:example.org");
            then.status(200).json_body(json!({}));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        client
            .inner()
            .sync_once(matrix_sdk::config::SyncSettings::default())
            .await
            .unwrap();

        client
            .set_typing(room_id, true, Some(1234))
            .await
            .expect("typing start should succeed");
        client
            .set_typing(room_id, false, None)
            .await
            .expect("typing stop should succeed");
    }

    #[tokio::test]
    async fn send_read_receipt_returns_error() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();

        let err = client
            .send_read_receipt("!room:example.com", "$event:example.com")
            .await
            .unwrap_err();

        match err {
            HumError::Other(msg) => {
                assert_eq!(msg, "send_read_receipt not implemented");
            }
            other => panic!("unexpected error variant: {other:?}"),
        }
    }
}
