//! Core Matrix client wrapper for the Hum application.
//!
//! This crate provides a small stable API over the `matrix-sdk`
//! allowing the application to remain independent from upstream
//! changes.

pub mod auth;
pub mod client;
pub mod config;
pub mod contacts;
pub mod devices;
pub mod error;
pub mod media;
pub mod messaging;
pub mod presence;
pub mod push;
pub mod recovery;
pub mod rooms;
pub mod sync;
pub mod timeline;

pub use client::HumClient;
pub use config::{ClientConfig as HumClientConfig, SyncConfig};
pub use error::{HumError, Result};
pub use timeline::TextMessage;
