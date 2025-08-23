use std::path::Path;
use std::sync::Mutex;

use rusqlite::{params, Connection, OptionalExtension};

use super::IMatrixStore;
use crate::{
    error::CoreResult,
    events::{MatrixEvent, RoomState},
    session::Session,
};

/// SQLite-backed store using rusqlite.
pub struct SqliteStore {
    conn: Mutex<Connection>,
}

impl SqliteStore {
    /// Open a new SQLite store at the given path.
    pub fn open(path: &Path) -> CoreResult<Self> {
        let conn = Connection::open(path)?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS session (data TEXT);
             CREATE TABLE IF NOT EXISTS room_state (room_id TEXT PRIMARY KEY, data TEXT);
             CREATE TABLE IF NOT EXISTS timeline (room_id TEXT, idx INTEGER, data TEXT);",
        )?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}

#[async_trait::async_trait]
impl IMatrixStore for SqliteStore {
    async fn put_session(&self, session: &Session) -> CoreResult<()> {
        let json = serde_json::to_string(session)?;
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM session", [])?;
        conn.execute("INSERT INTO session (data) VALUES (?1)", [json])?;
        Ok(())
    }

    async fn get_session(&self) -> CoreResult<Option<Session>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT data FROM session LIMIT 1")?;
        let opt: Option<String> = stmt.query_row([], |row| row.get(0)).optional()?;
        let session = opt.map(|json| serde_json::from_str(&json)).transpose()?;
        Ok(session)
    }

    async fn put_room_state(&self, room_id: &str, state: &RoomState) -> CoreResult<()> {
        let json = serde_json::to_string(state)?;
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO room_state (room_id, data) VALUES (?1, ?2)
             ON CONFLICT(room_id) DO UPDATE SET data=excluded.data",
            params![room_id, json],
        )?;
        Ok(())
    }

    async fn get_room_state(&self, room_id: &str) -> CoreResult<Option<RoomState>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT data FROM room_state WHERE room_id = ?1")?;
        let opt: Option<String> = stmt.query_row([room_id], |row| row.get(0)).optional()?;
        let state = opt.map(|json| serde_json::from_str(&json)).transpose()?;
        Ok(state)
    }

    async fn append_timeline_events(
        &self,
        room_id: &str,
        events: &[MatrixEvent],
    ) -> CoreResult<()> {
        let mut conn = self.conn.lock().unwrap();
        let tx = conn.transaction()?;
        let mut idx: i64 = tx.query_row(
            "SELECT COALESCE(MAX(idx), -1) FROM timeline WHERE room_id = ?1",
            [room_id],
            |row| row.get(0),
        )?;
        for ev in events {
            idx += 1;
            let json = serde_json::to_string(ev)?;
            tx.execute(
                "INSERT INTO timeline (room_id, idx, data) VALUES (?1, ?2, ?3)",
                params![room_id, idx, json],
            )?;
        }
        tx.commit()?;
        Ok(())
    }

    async fn get_timeline_slice(
        &self,
        room_id: &str,
        start: usize,
        end: usize,
    ) -> CoreResult<Vec<MatrixEvent>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT data FROM timeline WHERE room_id = ?1 AND idx >= ?2 AND idx < ?3 ORDER BY idx ASC",
        )?;
        let rows = stmt.query_map(params![room_id, start as i64, end as i64], |row| {
            let json: String = row.get(0)?;
            Ok(json)
        })?;
        let mut out = Vec::new();
        for row in rows {
            let json: String = row?;
            out.push(serde_json::from_str(&json)?);
        }
        Ok(out)
    }
}
