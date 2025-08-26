use std::collections::HashMap;
use std::sync::Mutex;

use super::IMatrixStore;
use crate::{
    error::{CoreError, CoreResult},
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
        let mut guard = self
            .session
            .lock()
            .map_err(|e| CoreError::MutexPoisoned(e.to_string()))?;
        *guard = Some(session.clone());
        Ok(())
    }

    async fn get_session(&self) -> CoreResult<Option<Session>> {
        Ok(self
            .session
            .lock()
            .map_err(|e| CoreError::MutexPoisoned(e.to_string()))?
            .clone())
    }

    async fn put_room_state(&self, room_id: &str, state: &RoomState) -> CoreResult<()> {
        self.room_state
            .lock()
            .map_err(|e| CoreError::MutexPoisoned(e.to_string()))?
            .insert(room_id.to_string(), state.clone());
        Ok(())
    }

    async fn get_room_state(&self, room_id: &str) -> CoreResult<Option<RoomState>> {
        Ok(self
            .room_state
            .lock()
            .map_err(|e| CoreError::MutexPoisoned(e.to_string()))?
            .get(room_id)
            .cloned())
    }

    async fn append_timeline_events(
        &self,
        room_id: &str,
        events: &[MatrixEvent],
    ) -> CoreResult<()> {
        let mut timelines = self
            .timelines
            .lock()
            .map_err(|e| CoreError::MutexPoisoned(e.to_string()))?;
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
        let timelines = self
            .timelines
            .lock()
            .map_err(|e| CoreError::MutexPoisoned(e.to_string()))?;
        let timeline = timelines.get(room_id).cloned().unwrap_or_default();
        let slice = timeline.into_iter().skip(start).take(end - start).collect();
        Ok(slice)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use futures::executor::block_on;
    use std::sync::Arc;

    fn sample_session() -> Session {
        Session {
            user_id: "@user:example.org".to_owned(),
            device_id: "DEVICEID".to_owned(),
            access_token: Some("token".to_owned()),
        }
    }

    fn sample_events(room_id: &str) -> Vec<MatrixEvent> {
        vec![
            MatrixEvent::Message {
                room_id: room_id.to_string(),
                sender: "alice".into(),
                body: "hi".into(),
            },
            MatrixEvent::Message {
                room_id: room_id.to_string(),
                sender: "bob".into(),
                body: "hello".into(),
            },
        ]
    }

    #[test]
    fn put_and_get_session_roundtrip() {
        let store = MemStore::new();
        let session = sample_session();
        block_on(store.put_session(&session)).unwrap();
        let retrieved = block_on(store.get_session()).unwrap();
        assert_eq!(retrieved, Some(session));
    }

    #[test]
    fn put_and_get_room_state_roundtrip() {
        let store = MemStore::new();
        let room_id = "!room:example.org";
        let state = RoomState {
            name: Some("name".into()),
            topic: Some("topic".into()),
        };
        block_on(store.put_room_state(room_id, &state)).unwrap();
        let retrieved = block_on(store.get_room_state(room_id)).unwrap();
        assert_eq!(retrieved, Some(state));
    }

    #[test]
    fn append_and_slice_timeline() {
        let store = MemStore::new();
        let room_id = "!room:example.org";
        let events = sample_events(room_id);
        block_on(store.append_timeline_events(room_id, &events)).unwrap();
        let slice = block_on(store.get_timeline_slice(room_id, 0, events.len())).unwrap();
        assert_eq!(slice, events);
    }

    #[test]
    fn mutex_poisoning_returns_error() {
        let store = Arc::new(MemStore::new());
        let store_for_thread = Arc::clone(&store);

        // Poison the session mutex by panicking while holding the lock.
        let _ = std::thread::spawn(move || {
            let _guard = store_for_thread.session.lock().unwrap();
            panic!("poison mutex");
        })
        .join();

        let err = block_on(store.get_session()).unwrap_err();
        assert!(matches!(err, CoreError::MutexPoisoned(_)));
    }
}
