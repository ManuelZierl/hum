import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsItem, Icon } from '@hum/ui-components';

const meta: Meta<typeof SettingsItem> = {
  title: 'Components/SettingsItem',
  component: SettingsItem,
  args: {
    title: 'Account',
    subtitle: 'Manage your account',
  },
  argTypes: {
    onPress: { action: 'pressed' },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsItem>;

export const Basic: Story = {
  render: (args) => <SettingsItem {...args} icon={<Icon name="person" />} />,
};

export const WithoutSubtitle: Story = {
  render: (args) => (
    <SettingsItem
      {...args}
      icon={<Icon name="person" />}
      subtitle={undefined}
    />
  ),
};

export const CustomIcon: Story = {
  render: (args) => <SettingsItem {...args} icon={<Icon name="lock" />} />,
};
