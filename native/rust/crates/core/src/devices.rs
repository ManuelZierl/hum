//! Device & session management.

use crate::{client::HumClient, error::Result};
use matrix_sdk::ruma::{DeviceId, OwnedDeviceId};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct DeviceInfo {
    pub device_id: String,
    pub display_name: Option<String>,
}

impl HumClient {
    pub async fn get_devices(&self) -> Result<Vec<DeviceInfo>> {
        let resp = self.client.devices().await?;
        Ok(resp
            .devices
            .into_iter()
            .map(|d| DeviceInfo {
                device_id: d.device_id.to_string(),
                display_name: d.display_name,
            })
            .collect())
    }

    pub async fn rename_device(&self, device_id: &str, name: &str) -> Result<()> {
        let dev: &DeviceId = device_id.into();
        self.client.rename_device(dev, name).await?;
        Ok(())
    }

    pub async fn delete_device(&self, device_id: &str) -> Result<()> {
        let dev: OwnedDeviceId = device_id.into();
        self.client.delete_devices(&[dev], None).await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::prelude::*;
    use serde_json::json;
    use tempfile::tempdir;

    #[tokio::test]
    async fn devices_list_rename_delete() {
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
        let devices_mock = server.mock(|when, then| {
            when.method(GET).path("/_matrix/client/v3/devices");
            then.status(200).json_body(json!({
                "devices": [
                    {"device_id": "DEV1", "display_name": "Phone"},
                    {"device_id": "DEV2", "display_name": null}
                ]
            }));
        });
        let rename_mock = server.mock(|when, then| {
            when.method(PUT).path("/_matrix/client/v3/devices/DEV1");
            then.status(200).json_body(json!({}));
        });
        let delete_mock = server.mock(|when, then| {
            when.method(POST).path("/_matrix/client/v3/delete_devices");
            then.status(200).json_body(json!({}));
        });

        let dir = tempdir().unwrap();
        let cfg = crate::config::ClientConfig::new(server.base_url(), dir.path().to_path_buf());
        let client = HumClient::new(cfg).await.unwrap();
        client.login_username("me", "pw").await.unwrap();

        let devices = client.get_devices().await.unwrap();
        assert_eq!(devices.len(), 2);
        assert_eq!(devices[0].device_id, "DEV1");
        client.rename_device("DEV1", "NewName").await.unwrap();
        client.delete_device("DEV1").await.unwrap();

        devices_mock.assert();
        rename_mock.assert();
        delete_mock.assert();
    }
}
