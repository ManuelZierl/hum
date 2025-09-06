// TurboModule spec skeleton (New Architecture).
// This is optional at this stage; included for future codegen wiring.

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // We expose a minimal entry point to match the TS contract in index.ts/types.ts
  // Native implementation will return an opaque numeric handle; JS wrapper will
  // bind that handle to a high-level Client object.
  createClient(hsUrl: string, storePath: string): Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('HumNative');

