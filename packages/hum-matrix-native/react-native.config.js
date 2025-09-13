module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.hum.nativepkg.HumNativePackage;',
        packageInstance: 'new HumNativePackage()',
      },
      ios: {
        podspecPath: './HumNative.podspec',
      },
    },
  },
};
