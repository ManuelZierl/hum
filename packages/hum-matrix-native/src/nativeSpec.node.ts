/* eslint-disable @typescript-eslint/no-require-imports */
import path from 'path';
import type { NativeBindings } from './nativeSpec.types';

// Resolve the built addon. Adjust path if your build outputs elsewhere.
const addonPath = path.resolve(
  __dirname,
  '../../../native/rust/crates/core-native-node/index.node',
);

const addon = require(addonPath) as NativeBindings;

export default addon;
