//! Media upload/download helpers.

use crate::{client::HumClient, error::Result};
use matrix_sdk::media::{MediaFormat, MediaRequestParameters};
use matrix_sdk::ruma::events::room::MediaSource;
use mime::Mime;
use std::str::FromStr;

impl HumClient {
    /// Upload media bytes with a MIME type; returns content URI.
    pub async fn upload_media(&self, bytes: &[u8], mime: &str) -> Result<String> {
        let mime: Mime =
            Mime::from_str(mime).map_err(|e| crate::error::HumError::Other(e.to_string()))?;
        let resp = self
            .client
            .media()
            .upload(&mime, bytes.to_vec(), None)
            .await?;
        Ok(resp.content_uri.to_string())
    }

    /// Download media by content URI (MXC).
    pub async fn download_media(&self, content_uri: &str) -> Result<Vec<u8>> {
        let mxc: matrix_sdk::ruma::OwnedMxcUri = content_uri.into();
        let req = MediaRequestParameters {
            source: MediaSource::Plain(mxc),
            format: MediaFormat::File,
        };
        let data = self.client.media().get_media_content(&req, true).await?;
        Ok(data)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use serde_json::json;
    use tempfile::tempdir;

    #[tokio::test]
    async fn media_upload_download() {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let _login = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEVICE",
                "user_id": "@me:example.org"
            }));
        });
        // encryption key upload noise
        let _keys_upload = server.mock(|when, then| {
            when.method(POST).path_contains("/_matrix/client/v3/keys/");
            then.status(200).json_body(json!({}));
        });
        // Leave media endpoints unmatched; we only assert method contracts without network.

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("me", "pw").await.unwrap();

        let _ = client.upload_media(b"hello", "text/plain").await.err();
    }
}
