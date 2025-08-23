//! Matrix core abstractions for config, session, events and storage.
//!
//! This crate defines a minimal, self-contained boundary that higher level
//! application crates can depend on. It intentionally avoids networking or
//! Matrix-specific SDK dependencies. Consumers are expected to implement
//! network logic separately while relying on the types and storage contracts
//! provided here.

mod config;
mod error;
mod events;
mod session;
mod store;

pub use config::ClientConfig;
pub use error::{CoreError, CoreResult};
pub use events::{MatrixEvent, RoomState};
pub use session::Session;
pub use store::IMatrixStore;

#[cfg(feature = "mem-store")]
pub use store::mem::MemStore;

#[cfg(feature = "sqlite")]
pub use store::sqlite::SqliteStore;

#[cfg(test)]
mod tests {
    use super::*;
    use futures::executor::block_on;

    #[cfg(feature = "mem-store")]
    #[test]
    fn session_roundtrip() {
        let store = MemStore::new();
        let session = Session {
            user_id: "@alice:example.org".into(),
            device_id: "DEVICEID".into(),
            access_token: Some("token".into()),
        };
        block_on(store.put_session(&session)).unwrap();
        let loaded = block_on(store.get_session()).unwrap().unwrap();
        assert_eq!(loaded, session);
    }

    #[cfg(feature = "mem-store")]
    #[test]
    fn room_state_roundtrip() {
        let store = MemStore::new();
        let state = RoomState {
            name: Some("My Room".into()),
            topic: None,
        };
        block_on(store.put_room_state("!r:example.org", &state)).unwrap();
        let loaded = block_on(store.get_room_state("!r:example.org"))
            .unwrap()
            .unwrap();
        assert_eq!(loaded, state);
    }

    #[cfg(feature = "mem-store")]
    #[test]
    fn timeline_append_and_slice() {
        let store = MemStore::new();
        let events = vec![
            MatrixEvent::Message {
                room_id: "!r:example.org".into(),
                sender: "@a:ex".into(),
                body: "hi".into(),
            },
            MatrixEvent::Message {
                room_id: "!r:example.org".into(),
                sender: "@b:ex".into(),
                body: "hey".into(),
            },
        ];
        block_on(store.append_timeline_events("!r:example.org", &events)).unwrap();
        let slice = block_on(store.get_timeline_slice("!r:example.org", 0, 2)).unwrap();
        assert_eq!(slice, events);
    }

    #[test]
    fn event_serialization_roundtrip() {
        let ev = MatrixEvent::Typing {
            room_id: "!r:example.org".into(),
            user_ids: vec!["@a:ex".into()],
        };
        let json = serde_json::to_string(&ev).unwrap();
        let back: MatrixEvent = serde_json::from_str(&json).unwrap();
        assert_eq!(ev, back);
    }
}
