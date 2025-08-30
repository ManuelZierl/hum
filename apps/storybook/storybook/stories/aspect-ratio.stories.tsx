import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AspectRatio } from '@hum/ui-components';
import type { AspectRatioProps } from '@hum/ui-components';

const styles = StyleSheet.create({
  box: { flex: 1, backgroundColor: '#FECA1A' },
});

const Box: React.FC = () => <View style={styles.box} />;

const ExampleAspectRatio: React.FC<AspectRatioProps> = (props) => (
  <AspectRatio {...props}>
    <Box />
  </AspectRatio>
);

const meta: Meta<typeof ExampleAspectRatio> = {
  title: 'Components/AspectRatio',
  component: ExampleAspectRatio,
  argTypes: {
    ratio: { control: 'number' },
  },
  args: { ratio: 1 },
};

export default meta;

type Story = StoryObj<typeof ExampleAspectRatio>;

export const Basic: Story = {};
export const Wide: Story = { args: { ratio: 16 / 9 } };
export const Tall: Story = { args: { ratio: 9 / 16 } };
