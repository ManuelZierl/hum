fn main() {
    println!("cargo:rerun-if-changed=src");
    println!("cargo:rerun-if-changed=Cargo.toml");
    println!("cargo:rustc-check-cfg=cfg(coverage_nightly)");

    // Generate C header for the C ABI as include/hum.h
    let crate_dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let out_path = std::path::Path::new(&crate_dir)
        .join("include")
        .join("hum.h");
    std::fs::create_dir_all(out_path.parent().unwrap()).unwrap();
    let config = cbindgen::Config::from_root_or_default(&crate_dir);
    cbindgen::Builder::new()
        .with_crate(crate_dir)
        .with_config(config)
        .with_language(cbindgen::Language::C)
        .with_include_guard("HUM_H")
        .generate()
        .expect("Unable to generate bindings")
        .write_to_file(out_path);
}
