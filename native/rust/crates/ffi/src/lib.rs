pub fn ffi_greet(name: &str) -> String {
    hum_core::greet(name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ffi_greets() {
        assert_eq!(ffi_greet("FFI"), "Hello, FFI!");
    }
}
