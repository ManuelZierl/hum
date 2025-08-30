/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
declare module 'react-native' {
  import * as React from 'react';
  export const View: React.FC<any>;
  export const Text: React.FC<any>;
  export const Image: React.FC<any>;
  export const ScrollView: React.FC<any>;
  export const TextInput: React.FC<any>;
  export const Pressable: React.FC<any>;
  export const Modal: React.FC<any>;
  export const Animated: any;
  export const StyleSheet: {
    create: (styles: any) => any;
    absoluteFillObject: any;
    hairlineWidth: number;
  };
  export type StyleProp<T> = any;
  export interface ViewStyle {}
  export interface TextStyle {}
  export interface ViewProps {
    style?: any;
    [key: string]: any;
  }
  export interface TextProps {
    style?: any;
    [key: string]: any;
  }
  export interface PressableProps {
    disabled?: boolean;
    onPress?: (e: any) => void;
    style?: any;
    [key: string]: any;
  }
  export interface GestureResponderEvent {}
  export function useColorScheme(): 'light' | 'dark';
}

declare module 'react-native-safe-area-context' {
  export const useSafeAreaInsets: () => {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
