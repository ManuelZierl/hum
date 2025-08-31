#![allow(clippy::empty_line_after_doc_comments)]

use std::sync::Arc;

uniffi::include_scaffolding!("hum");

pub struct Client;

#[uniffi::export]
pub fn init(hs_url: String, store_path: String) -> Arc<Client> {
    let _ = (hs_url, store_path);
    Arc::new(Client)
}

#[uniffi::export]
impl Client {
    pub fn login(&self, username: String, password: String) {
        let _ = (username, password);
    }

    pub fn start_sync(&self, sliding: bool) {
        let _ = sliding;
    }

    pub fn send_text(&self, room_id: String, body: String) {
        let _ = (room_id, body);
    }
}
