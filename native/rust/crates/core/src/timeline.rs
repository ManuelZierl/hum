//! Timeline helpers for fetching and subscribing to messages.

use crate::{client::HumClient, error::Result};
use matrix_sdk::{
    event_handler::EventHandlerHandle,
    room::MessagesOptions,
    ruma::{
        OwnedRoomId, OwnedUserId, RoomId,
        events::room::message::{MessageType, OriginalSyncRoomMessageEvent},
    },
};
use tokio::sync::mpsc::UnboundedSender;

/// Simplified text message item used by higher layers (e.g., TUI / mobile).
#[derive(Debug, Clone)]
pub struct TextMessage {
    pub room_id: OwnedRoomId,
    pub sender: OwnedUserId,
    pub body: String,
    pub ts: i64,
}

impl HumClient {
    /// Add an event handler that forwards incoming text/notice messages to the provided channel.
    ///
    /// Returns an [`EventHandlerHandle`] that can be dropped to remove the handler.
    pub fn forward_text_messages_to(&self, tx: UnboundedSender<TextMessage>) -> EventHandlerHandle {
        let client = self.client.clone();
        client.add_event_handler(
            move |ev: OriginalSyncRoomMessageEvent, room: matrix_sdk::room::Room| {
                let tx = tx.clone();
                async move {
                    if room.state() == matrix_sdk::RoomState::Joined {
                        let body = match &ev.content.msgtype {
                            MessageType::Text(c) => Some(c.body.clone()),
                            MessageType::Notice(c) => Some(c.body.clone()),
                            _ => None,
                        };
                        if let Some(body) = body {
                            let _ = tx.send(TextMessage {
                                room_id: room.room_id().to_owned(),
                                sender: ev.sender.to_owned(),
                                body,
                                ts: ev.origin_server_ts.0.into(),
                            });
                        }
                    }
                }
            },
        )
    }

    /// Fetch a page of recent text/notice messages from a room, in backward direction.
    ///
    /// - `from`: if provided, continue pagination from this token; otherwise start at the end.
    /// - `limit`: max number of events to fetch.
    ///
    /// Returns the messages (most recent last) and the next `from` token to request older events.
    pub async fn fetch_recent_text_messages(
        &self,
        room_id: &RoomId,
        from: Option<&str>,
        limit: u32,
    ) -> Result<(Vec<TextMessage>, Option<String>)> {
        let room = self
            .client
            .get_room(room_id)
            .ok_or_else(|| crate::error::HumError::Other("room not found".into()))?;

        let mut opts = MessagesOptions::backward();
        // Safe conversion: UInt implements From<u32>.
        opts.limit = limit.into();
        opts = opts.from(from);

        let response = room.messages(opts).await?;
        let next_from = response.end.clone();

        let mut out = Vec::new();
        for ev in response.chunk {
            // Try to deserialize as an original room message event.
            if let Ok(msg) = ev.raw().deserialize_as::<OriginalSyncRoomMessageEvent>() {
                let body = match &msg.content.msgtype {
                    MessageType::Text(c) => Some(c.body.clone()),
                    MessageType::Notice(c) => Some(c.body.clone()),
                    _ => None,
                };
                if let Some(body) = body {
                    out.push(TextMessage {
                        room_id: room_id.to_owned(),
                        sender: msg.sender.to_owned(),
                        body,
                        ts: msg.origin_server_ts.0.into(),
                    });
                }
            }
        }

        // Ensure chronological order (oldest first, newest last)
        out.sort_by_key(|m| m.ts);
        Ok((out, next_from))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use matrix_sdk::config::SyncSettings;
    use serde_json::json;
    use tempfile::tempdir;
    use tokio::time::{Duration, timeout};

    #[tokio::test]
    async fn installs_forwarder_handler() {
        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(
            "https://example.com".into(),
            dir.path().to_path_buf(),
        );
        let client = HumClient::new(cfg).await.unwrap();

        let (tx, _rx) = tokio::sync::mpsc::unbounded_channel::<TextMessage>();
        let handle = client.forward_text_messages_to(tx);
        // Drop the handle to ensure it is detachable without panicking.
        drop(handle);
    }

    #[tokio::test]
    async fn fetch_recent_text_messages_from_messages_endpoint() {
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
        // Introduce joined room via sync
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
        // messages endpoint returning two message events out of order by ts
        let _messages = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/v3/rooms/!r:example.org/messages");
            then.status(200).json_body(json!({
                "start": "p",
                "end": "n",
                "chunk": [
                    {
                        "type": "m.room.message",
                        "event_id": "$2",
                        "sender": "@b:example.org",
                        "origin_server_ts": 1000,
                        "content": { "msgtype": "m.notice", "body": "hello" }
                    },
                    {
                        "type": "m.room.message",
                        "event_id": "$1",
                        "sender": "@a:example.org",
                        "origin_server_ts": 2000,
                        "content": { "msgtype": "m.text", "body": "world" }
                    }
                ]
            }));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();
        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let room_id: matrix_sdk::ruma::OwnedRoomId = "!r:example.org".parse().unwrap();
        let (msgs, next) = client
            .fetch_recent_text_messages(room_id.as_ref(), None, 50)
            .await
            .unwrap();

        assert_eq!(msgs.len(), 2);
        assert_eq!(msgs[0].body, "hello");
        assert_eq!(msgs[1].body, "world");
        assert_eq!(next.as_deref(), Some("n"));
    }

    #[tokio::test]
    async fn forwarder_receives_message_from_sync() {
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
        // sync that includes a text event in a joined room
        let _sync = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/sync");
            then.status(200).json_body(json!({
                "next_batch": "s1",
                "rooms": {"join": {"!r:example.org": {
                    "summary": {},
                    "state": { "events": [] },
                    "timeline": { "events": [
                        {
                            "type": "m.room.message",
                            "event_id": "$x",
                            "sender": "@a:example.org",
                            "origin_server_ts": 1234,
                            "content": { "msgtype": "m.text", "body": "hi" }
                        }
                    ], "limited": false, "prev_batch": "t" },
                    "ephemeral": { "events": [] },
                    "account_data": { "events": [] },
                    "unread_notifications": {}
                }}}
            }));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("user", "pass").await.unwrap();

        let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<TextMessage>();
        let _handle = client.forward_text_messages_to(tx);

        client
            .inner()
            .sync_once(SyncSettings::default())
            .await
            .unwrap();

        let msg = timeout(Duration::from_secs(1), async move { rx.recv().await })
            .await
            .expect("timed out")
            .expect("channel closed");
        assert_eq!(msg.body, "hi");
    }
}
