import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CallItem, ThemeProvider } from '@hum/ui-components';

const meta: Meta<typeof CallItem> = {
  title: 'Components/CallItem',
  component: CallItem,
  argTypes: {
    type: {
      control: { type: 'inline-radio' },
      options: ['incoming', 'outgoing', 'missed'],
    },
    isVideo: { control: 'boolean' },
    onPress: { action: 'press' },
    onPressCall: { action: 'call' },
  },
  args: {
    avatar:
      'https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Alice',
    subtitle: 'Yesterday, 18:40',
    type: 'incoming',
    isVideo: false,
  },
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="dark">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
};

export default meta;

export type Story = StoryObj<typeof CallItem>;

export const Basic: Story = {};
