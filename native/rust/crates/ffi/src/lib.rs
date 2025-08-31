#![allow(clippy::empty_line_after_doc_comments, clippy::useless_conversion)]

use std::{path::PathBuf, sync::Arc};

use hum_matrix_core::{client::HumClient, config::ClientConfig, error::HumError};

uniffi::include_scaffolding!("hum");

/// Errors that can occur when using the FFI client.
#[derive(Debug, thiserror::Error)]
pub enum FfiError {
    /// Any other error.
    #[error("{msg}")]
    Other { msg: String },
}

impl From<HumError> for FfiError {
    fn from(err: HumError) -> Self {
        FfiError::Other {
            msg: err.to_string(),
        }
    }
}

type Result<T, E = FfiError> = std::result::Result<T, E>;

/// FFI client holding a Matrix client and its runtime.
pub struct Client {
    /// Underlying [`HumClient`].
    inner: HumClient,
    /// Tokio runtime used for async operations. Declared last so it drops last.
    runtime: tokio::runtime::Runtime,
}

#[uniffi::export]
pub fn init(hs_url: String, store_path: String) -> Result<Arc<Client>> {
    let runtime =
        tokio::runtime::Runtime::new().map_err(|e| FfiError::Other { msg: e.to_string() })?;
    let cfg = ClientConfig::new(hs_url, PathBuf::from(store_path));
    let client = runtime.block_on(HumClient::new(cfg))?;
    Ok(Arc::new(Client {
        inner: client,
        runtime,
    }))
}

#[uniffi::export]
impl Client {
    /// Log in with a username and password.
    pub fn login(&self, username: String, password: String) -> Result<()> {
        self.runtime
            .block_on(self.inner.login(&username, &password))
            .map_err(Into::into)
    }

    /// Start the sync loop.
    pub fn start_sync(&self, sliding: bool) -> Result<()> {
        self.runtime
            .block_on(self.inner.start_sync(sliding))
            .map_err(Into::into)
    }

    /// Send a text message to a room.
    pub fn send_text(&self, room_id: String, body: String) -> Result<()> {
        self.runtime
            .block_on(self.inner.send_text_message(&room_id, &body))
            .map_err(Into::into)
    }
}
