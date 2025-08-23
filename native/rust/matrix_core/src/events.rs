use serde::{Deserialize, Serialize};

/// A condensed set of Matrix events exposed to applications.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MatrixEvent {
    /// A room message with plain text content.
    Message {
        room_id: String,
        sender: String,
        body: String,
    },
    /// A read receipt for a specific event.
    Receipt {
        room_id: String,
        event_id: String,
        user_id: String,
    },
    /// Users currently typing in a room.
    Typing {
        room_id: String,
        user_ids: Vec<String>,
    },
    /// Metadata for a room such as name or topic.
    RoomMeta {
        room_id: String,
        name: Option<String>,
        topic: Option<String>,
    },
}

/// Persistent state for a room.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RoomState {
    /// Display name of the room.
    pub name: Option<String>,
    /// Topic for the room.
    pub topic: Option<String>,
}
