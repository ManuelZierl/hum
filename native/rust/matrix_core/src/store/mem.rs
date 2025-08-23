use std::collections::HashMap;
use std::sync::Mutex;

use super::IMatrixStore;
use crate::{
    error::CoreResult,
    events::{MatrixEvent, RoomState},
    session::Session,
};

/// Simple in-memory store useful for tests.
#[derive(Default)]
pub struct MemStore {
    session: Mutex<Option<Session>>,
    room_state: Mutex<HashMap<String, RoomState>>,
    timelines: Mutex<HashMap<String, Vec<MatrixEvent>>>,
}

impl MemStore {
    /// Create a new empty in-memory store.
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl IMatrixStore for MemStore {
    async fn put_session(&self, session: &Session) -> CoreResult<()> {
        let mut guard = self.session.lock().unwrap();
        *guard = Some(session.clone());
        Ok(())
    }

    async fn get_session(&self) -> CoreResult<Option<Session>> {
        Ok(self.session.lock().unwrap().clone())
    }

    async fn put_room_state(&self, room_id: &str, state: &RoomState) -> CoreResult<()> {
        self.room_state
            .lock()
            .unwrap()
            .insert(room_id.to_string(), state.clone());
        Ok(())
    }

    async fn get_room_state(&self, room_id: &str) -> CoreResult<Option<RoomState>> {
        Ok(self.room_state.lock().unwrap().get(room_id).cloned())
    }

    async fn append_timeline_events(
        &self,
        room_id: &str,
        events: &[MatrixEvent],
    ) -> CoreResult<()> {
        let mut timelines = self.timelines.lock().unwrap();
        let timeline = timelines.entry(room_id.to_string()).or_default();
        timeline.extend_from_slice(events);
        Ok(())
    }

    async fn get_timeline_slice(
        &self,
        room_id: &str,
        start: usize,
        end: usize,
    ) -> CoreResult<Vec<MatrixEvent>> {
        let timelines = self.timelines.lock().unwrap();
        let timeline = timelines.get(room_id).cloned().unwrap_or_default();
        let slice = timeline.into_iter().skip(start).take(end - start).collect();
        Ok(slice)
    }
}
