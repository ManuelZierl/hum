//! Error types for the Hum Matrix client.

use thiserror::Error;

/// Result type used by this crate.
pub type Result<T, E = HumError> = std::result::Result<T, E>;

/// Errors that can occur within the core client.
#[derive(Debug, Error)]
pub enum HumError {
    /// Error returned by the underlying Matrix SDK.
    #[error(transparent)]
    Matrix(Box<matrix_sdk::Error>),
    /// Any other error.
    #[error("{0}")]
    Other(String),
}

impl From<matrix_sdk::Error> for HumError {
    fn from(err: matrix_sdk::Error) -> Self {
        HumError::Matrix(Box::new(err))
    }
}

impl From<anyhow::Error> for HumError {
    fn from(err: anyhow::Error) -> Self {
        HumError::Other(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn convert_anyhow() {
        let err = anyhow::anyhow!("oops");
        let hum: HumError = err.into();
        match hum {
            HumError::Other(msg) => assert_eq!(msg, "oops"),
            _ => panic!("wrong variant"),
        }
    }
}
