/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
declare module 'react-native' {
  import * as React from 'react';
  export const View: React.FC<any>;
  export const Text: React.FC<any>;
  export const Image: React.FC<any>;
  export const Pressable: React.FC<any>;
  export const Animated: any;
  export const StyleSheet: { create: (styles: any) => any };
  export type StyleProp<T> = any;
  export interface ViewStyle {}
  export interface TextStyle {}
  export interface ViewProps {}
  export interface PressableProps {
    disabled?: boolean;
    [key: string]: any;
  }
  export function useColorScheme(): 'light' | 'dark';
}
