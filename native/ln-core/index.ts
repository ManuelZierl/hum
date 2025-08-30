import { requireNativeModule } from 'expo-modules-core';

export interface LnCore {
  ping(): Promise<string>;
}

const LnCoreModule = requireNativeModule<LnCore>('LnCore');

export const LnCore = {
  ping: () => LnCoreModule.ping(),
};

export default LnCore;
