import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListRow, Icon } from '@hum/ui-components';

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
  render: (args) => <ListRow {...args} icon={<Icon name="box" />} />,
};

export const NoRightText: Story = {
  render: (args) => (
    <ListRow {...args} icon={<Icon name="box" />} rightText={undefined} />
  ),
};

export const CustomCount: Story = {
  render: (args) => (
    <ListRow {...args} icon={<Icon name="box" />} rightText="42" />
  ),
};
