//! Contacts and user search.

use crate::{client::HumClient, error::Result};
use matrix_sdk::ruma::api::client::user_directory::search_users::v3::User as DirectoryUser;

/// Simplified user info for search results.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UserInfo {
    pub user_id: String,
    pub display_name: Option<String>,
}

impl HumClient {
    /// Search users by query string.
    pub async fn search_users(&self, query: &str, limit: Option<u32>) -> Result<Vec<UserInfo>> {
        let limit = limit.unwrap_or(10) as u64;
        let resp = self.client.search_users(query, limit).await?;
        Ok(resp
            .results
            .into_iter()
            .map(|u: DirectoryUser| UserInfo {
                user_id: u.user_id.to_string(),
                display_name: u.display_name,
            })
            .collect())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use serde_json::json;
    use tempfile::tempdir;

    #[tokio::test]
    async fn search_users_hits_endpoint() {
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
        let search_mock = server.mock(|when, then| {
            when.method(POST)
                .path("/_matrix/client/v3/user_directory/search");
            then.status(200).json_body(json!({
                "limited": false,
                "results": [
                    {"user_id": "@a:example.org", "display_name": "Alice"},
                    {"user_id": "@b:example.org", "display_name": null}
                ]
            }));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("me", "pw").await.unwrap();
        let users = client.search_users("a", Some(10)).await.unwrap();
        assert_eq!(users.len(), 2);
        assert_eq!(users[0].user_id, "@a:example.org");
        search_mock.assert();
    }
}
