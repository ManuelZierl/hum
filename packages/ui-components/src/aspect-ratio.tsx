import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface AspectRatioProps extends React.ComponentProps<typeof View> {
  ratio?: number;
}

export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = 1,
  style,
  children,
  testID,
  ...props
}) => {
  const { colors } = useTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { aspectRatio: ratio, backgroundColor: colors.background },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});

export default AspectRatio;
