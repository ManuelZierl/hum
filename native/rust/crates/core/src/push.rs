//! Push notification token registration.
// TODO: do we need this? Or can this be handled by react native?
use crate::{
    client::HumClient,
    error::{HumError, Result},
};

impl HumClient {
    pub async fn register_push_token(&self, _token: &str, _platform: &str) -> Result<()> {
        Err(HumError::Other(
            "register_push_token not implemented".into(),
        ))
    }

    pub async fn unregister_push_token(&self, _token: &str) -> Result<()> {
        Err(HumError::Other(
            "unregister_push_token not implemented".into(),
        ))
    }
}
