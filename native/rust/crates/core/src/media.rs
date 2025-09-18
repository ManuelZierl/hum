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

    #[tokio::test]
    async fn upload_and_download_media_roundtrip() {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });
        let _well_known = server.mock(|when, then| {
            when.method(GET).path("/.well-known/matrix/client");
            then.status(200).json_body(json!({
                "m.homeserver": {"base_url": server.base_url()}
            }));
        });
        let _login = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/login");
            then.status(200).json_body(json!({
                "access_token": "ACCESS",
                "device_id": "DEVICE",
                "user_id": "@me:example.org"
            }));
        });
        let _keys_upload = server.mock(|when, then| {
            when.method(POST).path_contains("/_matrix/client/v3/keys/");
            then.status(200).json_body(json!({}));
        });
        let _media_cfg = server.mock(|when, then| {
            when.method(GET)
                .path("/_matrix/client/unstable/org.matrix.msc3916/media/config");
            then.status(200)
                .json_body(json!({"m.upload.size": 10_485_760 }));
        });
        let uploaded_uri = "mxc://example.org/mediaid";
        let upload_body = json!({ "content_uri": uploaded_uri });
        let _upload = server.mock(|when, then| {
            when.method(POST).path_contains("upload");
            then.status(200).json_body(upload_body.clone());
        });
        let _download = server.mock(|when, then| {
            when.method(GET).path_contains("download");
            then.status(200).body("downloaded");
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("me", "pw").await.unwrap();

        let uri = client.upload_media(b"hello", "text/plain").await.unwrap();
        assert_eq!(uri, uploaded_uri);
        _upload.assert();

        let data = client.download_media(&uri).await.unwrap();
        assert_eq!(data, b"downloaded");
        _download.assert();
    }

    #[tokio::test]
    async fn upload_media_invalid_mime_rejected() {
        let server = MockServer::start();
        let _versions = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/versions");
            then.status(200)
                .json_body(json!({ "versions": ["v1.8"], "unstable_features": {} }));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();

        let err = client
            .upload_media(b"hello", "not/a mime")
            .await
            .unwrap_err();
        match err {
            crate::error::HumError::Other(msg) => assert!(msg.contains("mime")),
            other => panic!("unexpected error variant: {other:?}"),
        }
    }
}
