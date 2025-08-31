#[cfg(test)]
mod tests {
    use hum_core::greet;

    #[test]
    fn core_greets() {
        assert_eq!(greet("Hum"), "Hello, Hum!");
    }
}
