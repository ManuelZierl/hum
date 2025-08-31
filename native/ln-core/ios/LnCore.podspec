require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'LnCore'
  s.version      = package['version']
  s.summary      = 'Lightning core native module stub.'
  s.homepage     = 'https://example.com'
  s.license      = { :type => 'AGPL-3.0-only' }
  s.authors      = { 'hum' => 'support@example.com' }
  s.platform     = :ios, '13.0'
  s.source       = { :git => 'https://example.com', :tag => s.version }
  s.source_files = '*.{h,m,mm,swift}'
  s.requires_arc = true
  s.dependency   'ExpoModulesCore'
end
