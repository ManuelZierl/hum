import path from 'node:path';
import { createRequire } from 'node:module';
import type { NativeBindings } from './nativeSpec.types';

const require_ = createRequire(__filename);

const addonPath = path.resolve(
  __dirname,
  '../../../native/rust/crates/core-native-node/index.node',
);

const addon = require_(addonPath) as NativeBindings;

export default addon;
