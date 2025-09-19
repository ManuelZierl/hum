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

impl From<matrix_sdk::ClientBuildError> for HumError {
    fn from(err: matrix_sdk::ClientBuildError) -> Self {
        HumError::Other(err.to_string())
    }
}

impl From<matrix_sdk::HttpError> for HumError {
    fn from(err: matrix_sdk::HttpError) -> Self {
        HumError::Other(err.to_string())
    }
}

impl From<matrix_sdk::IdParseError> for HumError {
    fn from(err: matrix_sdk::IdParseError) -> Self {
        HumError::Other(err.to_string())
    }
}

impl From<matrix_sdk::encryption::CryptoStoreError> for HumError {
    fn from(err: matrix_sdk::encryption::CryptoStoreError) -> Self {
        HumError::Other(err.to_string())
    }
}

impl From<matrix_sdk::encryption::secret_storage::SecretStorageError> for HumError {
    fn from(err: matrix_sdk::encryption::secret_storage::SecretStorageError) -> Self {
        HumError::Other(err.to_string())
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

    #[test]
    fn convert_matrix_sdk_error() {
        let hum: HumError = matrix_sdk::Error::AuthenticationRequired.into();
        match hum {
            HumError::Matrix(inner) => match *inner {
                matrix_sdk::Error::AuthenticationRequired => {}
                _ => panic!("unexpected matrix error variant"),
            },
            _ => panic!("expected matrix error"),
        }
    }

    #[test]
    fn convert_client_build_error() {
        let hum: HumError = matrix_sdk::ClientBuildError::MissingHomeserver.into();
        match hum {
            HumError::Other(msg) => {
                assert_eq!(msg, "no homeserver or user ID was configured");
            }
            _ => panic!("expected stringified client build error"),
        }
    }

    #[test]
    fn convert_http_error() {
        let hum: HumError = matrix_sdk::HttpError::NotClientRequest.into();
        match hum {
            HumError::Other(msg) => {
                assert_eq!(msg, "the queried endpoint is not meant for clients");
            }
            _ => panic!("expected http error string"),
        }
    }

    #[test]
    fn convert_id_parse_error() {
        let hum: HumError = matrix_sdk::IdParseError::MissingLeadingSigil.into();
        match hum {
            HumError::Other(msg) => {
                assert_eq!(msg, "leading sigil is incorrect or missing");
            }
            _ => panic!("expected id parse error string"),
        }
    }

    #[test]
    fn convert_crypto_store_error() {
        let hum: HumError = matrix_sdk::encryption::CryptoStoreError::AccountUnset.into();
        match hum {
            HumError::Other(msg) => {
                assert!(msg.contains("can't save/load sessions"));
            }
            _ => panic!("expected crypto store error string"),
        }
    }

    #[test]
    fn convert_secret_storage_error() {
        let hum: HumError =
            matrix_sdk::encryption::secret_storage::SecretStorageError::MissingKeyInfo {
                key_id: Some("key".to_owned()),
            }
            .into();
        match hum {
            HumError::Other(msg) => {
                assert!(msg.contains("secret key could not have been found"));
            }
            _ => panic!("expected secret storage error string"),
        }
    }
}
