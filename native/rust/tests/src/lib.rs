#[cfg(test)]
mod tests {
    use hum_matrix_core::{HumClient, config::ClientConfig};
    use tempfile::tempdir;

    #[tokio::test]
    #[ignore]
    async fn client_creation() {
        let dir = tempdir().unwrap();
        let cfg = ClientConfig::new("https://example.com".into(), dir.path().to_path_buf());
        HumClient::new(cfg).await.unwrap();
    }
}
