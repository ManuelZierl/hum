import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Text } from 'react-native';
import { Badge, type BadgeProps } from '@hum/ui-components';

const ExampleBadge: React.FC<BadgeProps> = (props) => (
  <Badge {...props}>
    <Text>Badge</Text>
  </Badge>
);

const meta: Meta<typeof ExampleBadge> = {
  title: 'Components/Badge',
  component: ExampleBadge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
  args: {
    variant: 'default',
  },
};
export default meta;

type Story = StoryObj<typeof ExampleBadge>;

export const Basic: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Destructive: Story = { args: { variant: 'destructive' } };
