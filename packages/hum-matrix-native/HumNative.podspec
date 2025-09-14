require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'HumNative'
  s.version      = package['version']
  s.summary      = 'Hum Matrix native module wrapper (scaffold)'
  s.homepage     = 'https://example.com'
  s.license      = { :type => 'AGPL-3.0-only' }
  s.author       = { 'Hum' => 'opensource@example.com' }
  s.platforms    = { :ios => '13.4' }
  s.source       = { :git => 'https://example.com/placeholder.git', :tag => s.version }

  # The Rust FFI produces a static xcframework named `ffi.xcframework`.
  # The Expo config plugin copies it under `ios/` beside this podspec.
  s.vendored_frameworks = 'ios/ffi.xcframework'

  # Public headers from the Rust FFI C API
  s.public_header_files = 'ios/include/**/*.h'
  s.header_mappings_dir = 'ios/include'
  s.source_files = 'ios/**/*.{h,m,mm}'

  # Static framework preferred for FFI
  s.static_framework = true

  s.dependency 'React-Core'
end
