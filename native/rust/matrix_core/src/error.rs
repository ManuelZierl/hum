use thiserror::Error;

/// Errors emitted by the Matrix core crate.
#[derive(Error, Debug)]
pub enum CoreError {
    /// Generic storage error.
    #[error("storage error: {0}")]
    Storage(String),
    /// Serialization or deserialization error.
    #[error(transparent)]
    Serde(#[from] serde_json::Error),
    #[cfg(feature = "sqlite")]
    #[error(transparent)]
    Sqlite(#[from] rusqlite::Error),
    /// Mutex was poisoned
    #[error("mutex poisoned: {0}")]
    MutexPoisoned(String),
}

/// Convenient result type used throughout the crate.
pub type CoreResult<T> = Result<T, CoreError>;
