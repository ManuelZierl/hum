import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListRow } from '@hum/ui-components';
import { Text } from 'react-native';

const meta: Meta<typeof ListRow> = {
  title: 'Components/ListRow',
  component: ListRow,
  args: {
    label: 'Archiviert',
    rightText: '5',
  },
  argTypes: {
    onPress: { action: 'pressed' },
  },
};

export default meta;

export type Story = StoryObj<typeof ListRow>;

export const Basic: Story = {
  render: (args) => <ListRow {...args} icon={<Text>📦</Text>} />,
};

export const NoRightText: Story = {
  render: (args) => (
    <ListRow {...args} icon={<Text>📦</Text>} rightText={undefined} />
  ),
};

export const CustomCount: Story = {
  render: (args) => <ListRow {...args} icon={<Text>📦</Text>} rightText="42" />,
};
