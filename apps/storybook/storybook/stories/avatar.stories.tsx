import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Text } from 'react-native';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  type AvatarProps,
} from '@hum/ui-components';

interface ExampleAvatarProps extends AvatarProps {
  uri?: string;
}

const ExampleAvatar: React.FC<ExampleAvatarProps> = ({
  uri = 'https://placekitten.com/200/200',
  ...props
}) => (
  <Avatar {...props}>
    <AvatarImage source={{ uri }} />
    <AvatarFallback>
      <Text>AB</Text>
    </AvatarFallback>
  </Avatar>
);

const meta: Meta<typeof ExampleAvatar> = {
  title: 'Components/Avatar',
  component: ExampleAvatar,
  argTypes: {
    size: { control: { type: 'number' } },
    uri: { control: 'text' },
  },
  args: { size: 40, uri: 'https://placekitten.com/200/200' },
};
export default meta;

type Story = StoryObj<typeof ExampleAvatar>;

export const Basic: Story = {};

export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>
        <Text>AB</Text>
      </AvatarFallback>
    </Avatar>
  ),
};

export const Large: Story = { args: { size: 80 } };
