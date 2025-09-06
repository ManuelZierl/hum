import type { HumMatrixNative, Client } from './types';
export * from './types';

// Placeholder JS implementation until native code is wired.
// All methods throw to make usage explicit during scaffolding.

function notImplemented(name: string): never {
  throw new Error(`@hum/hum-matrix-native: ${name} not implemented yet`);
}

const Module: HumMatrixNative = {
  async createClient(_hsUrl: string, _storePath: string): Promise<Client> {
    notImplemented('createClient');
  },
};

export default Module;

