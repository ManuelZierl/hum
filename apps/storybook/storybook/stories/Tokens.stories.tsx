import React from 'react';
import { View, Text } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { ThemeProvider, spacing, typography } from '@mchat/ui-tokens';

storiesOf('Tokens', module).add('Basics', () => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg }}>
      <Text style={{ fontSize: typography.fontSize.lg }}>Tokens Demo</Text>
    </View>
  </ThemeProvider>
));
