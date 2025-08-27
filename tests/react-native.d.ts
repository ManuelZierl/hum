declare module 'react-native' {
  import * as React from 'react';
  export const View: React.FC<any>;
  export const Text: React.FC<any>;
  export const Image: React.FC<any>;
  export const StyleSheet: { create: (styles: any) => any };
}
