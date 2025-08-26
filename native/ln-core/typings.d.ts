/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'expo-modules-core' {
  export class EventEmitter {
    constructor(...args: any[]);
    addListener(
      eventName: string,
      listener: (...args: any[]) => void,
    ): Subscription;
  }
  export interface Subscription {
    remove(): void;
  }
  export function requireNativeModule<T>(name: string): T;
}

declare module '@expo/config-plugins' {
  export type ConfigPlugin = (config: any) => any;
  export function withDangerousMod(config: any, mods: any): any;
}
