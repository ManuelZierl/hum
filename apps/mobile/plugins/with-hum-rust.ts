import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';

const PLUGIN_TAG = 'with-hum-rust';

function log(msg: string) {
  console.log(`${PLUGIN_TAG}: ${msg}`);
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src: string, dest: string) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      await copyDir(s, d);
    } else if (e.isFile()) {
      await fs.promises.mkdir(path.dirname(d), { recursive: true });
      await fs.promises.copyFile(s, d);
    }
  }
}

const withHumRust: ConfigPlugin = (config) => {
  if (process.env.WITH_HUM_RUST !== 'true') {
    log('skipping (set WITH_HUM_RUST=true to enable)');
    return config;
  }

  log('enabled. Will attempt to wire Rust artifacts if present.');
  log('Tip: build via native/rust/scripts/build-android.sh and build-ios.sh');

  // iOS: copy xcframework and header into the RN module so CocoaPods can vend it
  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      const repoRoot = path.resolve(c.modRequest.projectRoot, '..', '..');
      const iosOut =
        process.env.HUM_RUST_IOS_OUT ||
        path.join(repoRoot, 'native', 'rust', 'build', 'ios');
      const xcframeworkSrc = path.join(iosOut, 'ffi.xcframework');
      const headerSrc = path.join(
        repoRoot,
        'native',
        'rust',
        'crates',
        'ffi',
        'include',
        'hum.h',
      );

      const rnModuleIosDir = path.join(
        repoRoot,
        'packages',
        'hum-matrix-native',
        'ios',
      );
      const rnModuleHeaderDir = path.join(rnModuleIosDir, 'include');
      const rnModuleXcframeworkDest = path.join(
        rnModuleIosDir,
        'ffi.xcframework',
      );
      const rnModuleHeaderDest = path.join(rnModuleHeaderDir, 'hum.h');

      if (await pathExists(xcframeworkSrc)) {
        log(
          `copying iOS XCFramework to RN module: ${xcframeworkSrc} -> ${rnModuleXcframeworkDest}`,
        );
        await fs.promises.rm(rnModuleXcframeworkDest, {
          recursive: true,
          force: true,
        });
        await fs.promises.mkdir(rnModuleIosDir, { recursive: true });
        await copyDir(xcframeworkSrc, rnModuleXcframeworkDest);
        log('XCFramework copied');
      } else {
        log(`iOS XCFramework not found at ${xcframeworkSrc} (no-op)`);
      }

      if (await pathExists(headerSrc)) {
        await fs.promises.mkdir(rnModuleHeaderDir, { recursive: true });
        await fs.promises.copyFile(headerSrc, rnModuleHeaderDest);
        log(
          `copied FFI header to RN module: ${headerSrc} -> ${rnModuleHeaderDest}`,
        );
      } else {
        log(`FFI header not found at ${headerSrc} (no-op)`);
      }
      return c;
    },
  ]);

  // Android: copy jniLibs if present
  config = withDangerousMod(config, [
    'android',
    async (c) => {
      const repoRoot = path.resolve(c.modRequest.projectRoot, '..', '..');
      const androidOutBase =
        process.env.HUM_RUST_ANDROID_OUT ||
        path.join(repoRoot, 'native', 'rust', 'build', 'android');
      const jniLibsSrc = path.join(androidOutBase, 'jniLibs');
      const jniLibsDest = path.join(
        c.modRequest.projectRoot,
        'android',
        'app',
        'src',
        'main',
        'jniLibs',
      );

      if (await pathExists(jniLibsSrc)) {
        log(`copying JNI libs from ${jniLibsSrc} -> ${jniLibsDest}`);
        await copyDir(jniLibsSrc, jniLibsDest);
        log('JNI libs copied');
      } else {
        log(`JNI libs not found at ${jniLibsSrc} (no-op)`);
      }
      return c;
    },
  ]);

  return config;
};

export default withHumRust;
