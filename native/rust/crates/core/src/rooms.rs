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
}
