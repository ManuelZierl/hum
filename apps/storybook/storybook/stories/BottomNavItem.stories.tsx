import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  BottomNavItem,
  type BottomNavItemProps,
  Icon,
} from '@hum/ui-components';

const ExampleItem: React.FC<BottomNavItemProps> = (props) => (
  <BottomNavItem icon={<Icon name="chat" />} label="Inbox" {...props} />
);

const meta: Meta<typeof ExampleItem> = {
  title: 'Components/BottomNavItem',
  component: ExampleItem,
  argTypes: {
    onPress: { action: 'press' },
    isActive: { control: 'boolean' },
    badgeCount: { control: 'number' },
  },
  args: {
    isActive: false,
    badgeCount: 0,
  },
};
export default meta;

type Story = StoryObj<typeof ExampleItem>;

export const Basic: Story = {};
export const Active: Story = { args: { isActive: true } };
export const WithBadge: Story = { args: { badgeCount: 5 } };
