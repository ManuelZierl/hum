use async_trait::async_trait;

use crate::{
    error::CoreResult,
    events::{MatrixEvent, RoomState},
    session::Session,
};

/// Abstraction over persistent storage used by the client.
#[async_trait]
pub trait IMatrixStore: Send + Sync {
    /// Persist the user's session.
    async fn put_session(&self, session: &Session) -> CoreResult<()>;
    /// Retrieve the stored session if it exists.
    async fn get_session(&self) -> CoreResult<Option<Session>>;
    /// Store state information for a room.
    async fn put_room_state(&self, room_id: &str, state: &RoomState) -> CoreResult<()>;
    /// Retrieve room state, if any.
    async fn get_room_state(&self, room_id: &str) -> CoreResult<Option<RoomState>>;
    /// Append events to a room's timeline.
    async fn append_timeline_events(&self, room_id: &str, events: &[MatrixEvent])
        -> CoreResult<()>;
    /// Fetch a slice of timeline events by index range.
    async fn get_timeline_slice(
        &self,
        room_id: &str,
        start: usize,
        end: usize,
    ) -> CoreResult<Vec<MatrixEvent>>;
}

#[cfg(feature = "mem-store")]
pub mod mem;

#[cfg(feature = "sqlite")]
pub mod sqlite;
