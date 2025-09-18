//! Rooms & membership related APIs.

use crate::{
    client::HumClient,
    error::{HumError, Result},
};
use matrix_sdk::ruma::{OwnedRoomId, RoomId, RoomOrAliasId};
use serde::{Deserialize, Serialize};

/// Simplified room info.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomInfo {
    pub room_id: OwnedRoomId,
    pub name: Option<String>,
}

impl HumClient {
    /// Create a room with minimal options.
    pub async fn create_room(&self, opts: CreateRoomOptions) -> Result<RoomInfo> {
        use matrix_sdk::ruma::api::client::room::Visibility;
        use matrix_sdk::ruma::api::client::room::create_room::v3::Request as CreateReq;
        let mut req = CreateReq::new();
        req.name = opts.name.clone();
        req.topic = opts.topic.clone();
        req.visibility = if opts.is_public {
            Visibility::Public
        } else {
            Visibility::Private
        };
        let room = self.client.create_room(req).await?;
        Ok(RoomInfo {
            room_id: room.room_id().to_owned(),
            name: opts.name,
        })
    }

    /// Join a room by id or alias.
    pub async fn join_room(&self, id_or_alias: &str) -> Result<RoomInfo> {
        // Try alias then id.
        if let Ok(alias_or_id) = id_or_alias.parse::<Box<RoomOrAliasId>>() {
            let room = self
                .client
                .join_room_by_id_or_alias(alias_or_id.as_ref(), &[])
                .await?;
            return Ok(RoomInfo {
                room_id: room.room_id().to_owned(),
                name: None,
            });
        }
        let room_id: Box<matrix_sdk::ruma::RoomId> = id_or_alias.parse()?;
        let room = self.client.join_room_by_id(&room_id).await?;
        Ok(RoomInfo {
            room_id: room.room_id().to_owned(),
            name: None,
        })
    }

    /// Leave a room by id.
    pub async fn leave_room(&self, room_id: &str) -> Result<()> {
        let rid: matrix_sdk::ruma::OwnedRoomId = room_id.parse()?;
        let room = self
            .client
            .get_room(rid.as_ref())
            .ok_or_else(|| HumError::Other("room not found".into()))?;
        room.leave().await?;
        Ok(())
    }

    /// Get joined rooms.
    pub fn get_rooms(&self) -> Vec<RoomInfo> {
        self.client
            .joined_rooms()
            .into_iter()
            .map(|r| RoomInfo {
                room_id: r.room_id().to_owned(),
                name: None,
            })
            .collect()
    }

    /// Get a single room info.
    pub fn get_room(&self, room_id: &RoomId) -> Option<RoomInfo> {
        self.client.get_room(room_id).map(|r| RoomInfo {
            room_id: r.room_id().to_owned(),
            name: None,
        })
    }

    /// Invite a user to the room.
    pub async fn invite(&self, room_id: &RoomId, user: &matrix_sdk::ruma::UserId) -> Result<()> {
        let room = self
            .client
            .get_room(room_id)
            .ok_or_else(|| HumError::Other("room not found".into()))?;
        room.invite_user_by_id(user).await?;
        Ok(())
    }

    /// Kick a user from the room.
    pub async fn kick(
        &self,
        room_id: &RoomId,
        user: &matrix_sdk::ruma::UserId,
        reason: Option<&str>,
    ) -> Result<()> {
        let room = self
            .client
            .get_room(room_id)
            .ok_or_else(|| HumError::Other("room not found".into()))?;
        room.kick_user(user, reason).await?;
        Ok(())
    }

    /// Ban a user from the room.
    pub async fn ban(
        &self,
        room_id: &RoomId,
        user: &matrix_sdk::ruma::UserId,
        reason: Option<&str>,
    ) -> Result<()> {
        let room = self
            .client
            .get_room(room_id)
            .ok_or_else(|| HumError::Other("room not found".into()))?;
        room.ban_user(user, reason).await?;
        Ok(())
    }

    /// Set a user's power level in this room.
    pub async fn set_power(
        &self,
        room_id: &RoomId,
        user: &matrix_sdk::ruma::UserId,
        level: i64,
    ) -> Result<()> {
        let room = self
            .client
            .get_room(room_id)
            .ok_or_else(|| HumError::Other("room not found".into()))?;
        let int =
            js_int::Int::new(level).ok_or_else(|| HumError::Other("invalid power level".into()))?;
        room.update_power_levels(vec![(user, int)]).await?;
        Ok(())
    }
}

/// Options for room creation.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CreateRoomOptions {
    pub name: Option<String>,
    pub topic: Option<String>,
    pub is_public: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use matrix_sdk::{
        config::SyncSettings,
        ruma::{OwnedRoomId, RoomId, UserId},
    };
    use serde_json::json;
    use tempfile::tempdir;

    #[tokio::test]
    async fn create_room_calls_api() {
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
        let _create = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/createRoom");
            then.status(200)
                .json_body(json!({ "room_id": "!r:example.org" }));
        });
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        let info = client
            .create_room(CreateRoomOptions {
                name: Some("n".into()),
                topic: None,
                is_public: false,
            })
            .await
            .unwrap();
        assert_eq!(info.room_id.to_string(), "!r:example.org");
    }

    #[tokio::test]
    async fn join_room_by_alias_hits_endpoint() {
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
        let join_mock = server.mock(|when, then| {
            when.method(POST).path_contains("/_matrix/client/v3/join/");
            then.status(200)
                .json_body(json!({ "room_id": "!joined:example.org" }));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();

        let info = client.join_room("#room:example.org").await.unwrap();
        assert_eq!(info.room_id.to_string(), "!joined:example.org");
        join_mock.assert();
    }

    #[tokio::test]
    async fn join_room_invalid_identifier_errors() {
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

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();

        let err = client.join_room("not a room").await.unwrap_err();
        assert!(matches!(err, HumError::Other(_)));
    }

    #[tokio::test]
    async fn leave_room_calls_leave_endpoint() {
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
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!r:example.org": {
                    "summary": {},
                    "state": { "events": [{
                        "type": "m.room.power_levels",
                        "state_key": "",
                        "sender": "@user:example.org",
                        "event_id": "$pl",
                        "origin_server_ts": 0,
                        "content": {
                            "users": {"@user:example.org": 100},
                            "users_default": 0,
                            "events_default": 0,
                            "state_default": 0,
                            "ban": 50,
                            "kick": 50,
                            "invite": 50,
                            "events": {}
                        }
                    }]},
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });
        let leave_mock = server.mock(|when, then| {
            when.method(POST)
                .path_contains("/_matrix/client/v3/rooms/")
                .path_contains("/leave");
            then.status(200).json_body(json!({}));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        client.leave_room("!r:example.org").await.unwrap();
        leave_mock.assert();
    }

    #[tokio::test]
    async fn leave_room_without_joined_room_errors() {
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

        let (client, _dir) = logged_in_client(&server).await;
        let err = client.leave_room("!r:example.org").await.unwrap_err();
        assert!(matches!(err, HumError::Other(msg) if msg == "room not found"));
    }

    #[tokio::test]
    async fn get_rooms_returns_joined_rooms() {
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
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {
                    "!a:example.org": {
                        "summary": {},
                        "state": { "events": [] },
                        "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                        "ephemeral": { "events": [] },
                        "account_data": { "events": [] },
                        "unread_notifications": {}
                    },
                    "!b:example.org": {
                        "summary": {},
                        "state": { "events": [] },
                        "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                        "ephemeral": { "events": [] },
                        "account_data": { "events": [] },
                        "unread_notifications": {}
                    }
                }}
            }));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let rooms = client.get_rooms();
        let ids: Vec<String> = rooms.into_iter().map(|r| r.room_id.to_string()).collect();
        assert!(ids.contains(&"!a:example.org".to_string()));
        assert!(ids.contains(&"!b:example.org".to_string()));
    }

    #[tokio::test]
    async fn get_room_returns_joined_room() {
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
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!room:example.org": {
                    "summary": {},
                    "state": { "events": [{
                        "type": "m.room.power_levels",
                        "state_key": "",
                        "sender": "@user:example.org",
                        "event_id": "$pl",
                        "origin_server_ts": 0,
                        "content": {
                            "users": {"@user:example.org": 100},
                            "users_default": 0,
                            "events_default": 0,
                            "state_default": 0,
                            "ban": 50,
                            "kick": 50,
                            "invite": 50,
                            "events": {}
                        }
                    }]},
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let room_id = RoomId::parse("!room:example.org").unwrap();
        let info = client.get_room(&room_id).unwrap();
        assert_eq!(info.room_id, OwnedRoomId::from(room_id));
    }

    #[tokio::test]
    async fn invite_user_calls_endpoint() {
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
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!room:example.org": {
                    "summary": {},
                    "state": { "events": [{
                        "type": "m.room.power_levels",
                        "state_key": "",
                        "sender": "@user:example.org",
                        "event_id": "$pl",
                        "origin_server_ts": 0,
                        "content": {
                            "users": {"@user:example.org": 100},
                            "users_default": 0,
                            "events_default": 0,
                            "state_default": 0,
                            "ban": 50,
                            "kick": 50,
                            "invite": 50,
                            "events": {}
                        }
                    }]},
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });
        let invite_mock = server.mock(|when, then| {
            when.method(POST)
                .path_contains("/_matrix/client/v3/rooms/")
                .path_contains("/invite");
            then.status(200).json_body(json!({}));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let room_id = RoomId::parse("!room:example.org").unwrap();
        let user = UserId::parse("@friend:example.org").unwrap();
        client
            .invite(room_id.as_ref(), user.as_ref())
            .await
            .unwrap();
        invite_mock.assert();
    }

    #[tokio::test]
    async fn kick_user_calls_endpoint() {
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
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!room:example.org": {
                    "summary": {},
                    "state": { "events": [] },
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });
        let kick_mock = server.mock(|when, then| {
            when.method(POST)
                .path_contains("/_matrix/client/v3/rooms/")
                .path_contains("/kick");
            then.status(200).json_body(json!({}));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let room_id = RoomId::parse("!room:example.org").unwrap();
        let user = UserId::parse("@friend:example.org").unwrap();
        client
            .kick(room_id.as_ref(), user.as_ref(), Some("spam"))
            .await
            .unwrap();
        kick_mock.assert();
    }

    #[tokio::test]
    async fn ban_user_calls_endpoint() {
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
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!room:example.org": {
                    "summary": {},
                    "state": { "events": [] },
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });
        let ban_mock = server.mock(|when, then| {
            when.method(POST)
                .path_contains("/_matrix/client/v3/rooms/")
                .path_contains("/ban");
            then.status(200).json_body(json!({}));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let room_id = RoomId::parse("!room:example.org").unwrap();
        let user = UserId::parse("@friend:example.org").unwrap();
        client
            .ban(room_id.as_ref(), user.as_ref(), Some("spam"))
            .await
            .unwrap();
        ban_mock.assert();
    }

    #[tokio::test]
    async fn set_power_calls_endpoint() {
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
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!room:example.org": {
                    "summary": {},
                    "state": { "events": [{
                        "type": "m.room.power_levels",
                        "state_key": "",
                        "sender": "@user:example.org",
                        "event_id": "$pl",
                        "origin_server_ts": 0,
                        "content": {
                            "users": {"@user:example.org": 100},
                            "users_default": 0,
                            "events_default": 0,
                            "state_default": 0,
                            "ban": 50,
                            "kick": 50,
                            "invite": 50,
                            "events": {}
                        }
                    }]},
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });
        let power_mock = server.mock(|when, then| {
            when.method(PUT)
                .path_contains("/_matrix/client/v3/rooms/")
                .path_contains("/state/m.room.power_levels");
            then.status(200).json_body(json!({ "event_id": "$new" }));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let room_id = RoomId::parse("!room:example.org").unwrap();
        let user = UserId::parse("@friend:example.org").unwrap();
        client
            .set_power(room_id.as_ref(), user.as_ref(), 50)
            .await
            .unwrap();
        power_mock.assert();
    }

    #[tokio::test]
    async fn set_power_with_invalid_level_errors() {
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

        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!room:example.org": {
                    "summary": {},
                    "state": { "events": [{
                        "type": "m.room.power_levels",
                        "state_key": "",
                        "sender": "@user:example.org",
                        "event_id": "$pl",
                        "origin_server_ts": 0,
                        "content": {
                            "users": {"@user:example.org": 100},
                            "users_default": 0,
                            "events_default": 0,
                            "state_default": 0,
                            "ban": 50,
                            "kick": 50,
                            "invite": 50,
                            "events": {}
                        }
                    }]},
                    "timeline": { "events": [], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });

        let (client, _dir) = logged_in_client(&server).await;
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();
        let room_id = RoomId::parse("!room:example.org").unwrap();
        let user = UserId::parse("@friend:example.org").unwrap();
        let err = client
            .set_power(room_id.as_ref(), user.as_ref(), i64::MAX)
            .await
            .unwrap_err();
        let msg = format!("{}", err);
        assert!(msg.contains("invalid power level"));
    }

    async fn logged_in_client(server: &MockServer) -> (HumClient, tempfile::TempDir) {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        (client, dir)
    }
}
