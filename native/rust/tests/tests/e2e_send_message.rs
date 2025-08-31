use std::env;

use anyhow::{Result, anyhow};
use matrix_sdk::{
    Client,
    config::SyncSettings,
    ruma::{OwnedRoomId, events::room::message::RoomMessageEventContent},
};
use tempfile::tempdir;

#[tokio::test]
#[ignore]
async fn e2e_send_message() -> Result<()> {
    let username = match env::var("MATRIX_USERNAME") {
        Ok(v) => v,
        Err(_) => return Ok(()),
    };
    let password = match env::var("MATRIX_PASSWORD") {
        Ok(v) => v,
        Err(_) => return Ok(()),
    };
    let room_id_str = match env::var("MATRIX_ROOM") {
        Ok(v) => v,
        Err(_) => return Ok(()),
    };
    let homeserver =
        env::var("MATRIX_HOMESERVER").unwrap_or_else(|_| "https://matrix.org".to_owned());

    let dir = tempdir()?;
    let client = Client::builder()
        .homeserver_url(homeserver)
        .sqlite_store(dir.path(), None)
        .build()
        .await?;

    client
        .matrix_auth()
        .login_username(&username, &password)
        .initial_device_display_name("hum-tests")
        .send()
        .await?;
    client.sync_once(SyncSettings::default()).await?;

    let room_id: OwnedRoomId = room_id_str.parse()?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| anyhow!("Room not found"))?;

    let content = RoomMessageEventContent::text_plain("hello from hum tests");
    let response = room.send(content).await?;
    assert!(!response.event_id.as_str().is_empty());

    Ok(())
}
