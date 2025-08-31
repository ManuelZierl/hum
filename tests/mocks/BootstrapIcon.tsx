import React from 'react';
import { View } from 'react-native';

const BootstrapIcon = ({ width, height, fill, accessibilityLabel }: any) => (
  <View
    accessibilityLabel={accessibilityLabel}
    style={{ width, height, fill }}
  />
);

export default BootstrapIcon;
