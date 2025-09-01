//! Core Matrix client wrapper for the Hum application.
//!
//! This crate provides a small stable API over the `matrix-sdk`
//! allowing the application to remain independent from upstream
//! changes.

pub mod auth;
pub mod client;
pub mod config;
pub mod error;
pub mod messaging;
pub mod sync;
pub mod verification;

pub use client::HumClient;
pub use error::{HumError, Result};
pub use matrix_sdk::encryption::verification::{SasState, SasVerification};
