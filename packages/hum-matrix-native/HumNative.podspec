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

  s.source_files = 'ios/**/*.{h,m,mm,swift}'

  s.dependency 'React-Core'
end

