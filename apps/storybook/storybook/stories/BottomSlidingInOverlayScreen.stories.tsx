import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BottomSlidingInOverlayScreen,
  Button,
  OverlayProvider,
  useOverlay,
  ThemeProvider,
} from '@hum/ui-components';
import { View, Text, StyleSheet } from 'react-native';

const meta: Meta<typeof BottomSlidingInOverlayScreen> = {
  title: 'Components/BottomSlidingInOverlayScreen',
  component: BottomSlidingInOverlayScreen,
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="dark">
        <OverlayProvider>
          <StoryFn />
        </OverlayProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export type Story = StoryObj<typeof BottomSlidingInOverlayScreen>;

const styles = StyleSheet.create({
  content: { padding: 20 },
});

const Demo = () => {
  const { open } = useOverlay();
  return (
    <Button
      onPress={() =>
        open(
          <View style={styles.content}>
            <Text>Overlay content</Text>
          </View>,
        )
      }
    >
      <Text>Open Overlay</Text>
    </Button>
  );
};

export const Basic: Story = {
  render: () => <Demo />,
};
