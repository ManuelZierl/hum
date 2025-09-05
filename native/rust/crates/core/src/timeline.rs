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
