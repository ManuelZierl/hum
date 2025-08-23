//! Entry points for the `matrix_core` FFI.
//!
//! Functions exposed from this crate follow the conventions in `FFI.md` and map
//! directly to methods in the future Expo Module API.

#[no_mangle]
pub extern "C" fn matrix_core_sum(left: i32, right: i32) -> MatrixResult<i32> {
    MatrixResult::Ok(left + right)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_adds() {
        assert_eq!(matrix_core_sum(1, 1), 2);
    }
}
