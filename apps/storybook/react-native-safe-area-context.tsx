import * as React from 'react';
import { View } from 'react-native';

export const SafeAreaView = View;
export const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
export function useSafeAreaInsets() {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}
