#![allow(clippy::missing_safety_doc)]
#![cfg_attr(coverage_nightly, feature(coverage_attribute))]

use std::{
    ffi::{CStr, CString},
    os::raw::{c_char, c_int},
    path::PathBuf,
    ptr,
    sync::Arc,
};

use hum_matrix_core::rooms::CreateRoomOptions;
use hum_matrix_core::{
    client::HumClient,
    config::{ClientConfig, SyncConfig},
};

/// Opaque handle exposed to C.
#[repr(C)]
pub struct HumClientHandle {
    _private: [u8; 0],
}

pub(crate) struct HandleInner {
    pub(crate) inner: Option<Arc<HumClient>>,
    pub(crate) runtime: tokio::runtime::Runtime,
}

impl HandleInner {
    pub(crate) fn client(&self) -> &Arc<HumClient> {
        self.inner
            .as_ref()
            .expect("HumClient already freed from handle")
    }
}

impl Drop for HandleInner {
    fn drop(&mut self) {
        if let Some(inner) = self.inner.take() {
            let _guard = self.runtime.enter();
            drop(inner);
        }
    }
}

#[inline(never)]
pub(crate) fn set_error(err_out: *mut *mut c_char, msg: String) {
    if err_out.is_null() {
        return;
    }
    let c = CString::new(msg).unwrap_or_else(|_| CString::new("invalid error").unwrap());
    unsafe {
        *err_out = c.into_raw();
    }
}

// Expose submodules
pub mod ffi;
pub mod impls;

#[cfg(test)]
mod tests;
