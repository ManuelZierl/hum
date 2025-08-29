import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TabBarMock } from '@mchat/mobile-ui';

const meta: Meta = { title: 'Shell/TabBarMock' };
export default meta;

type Story = StoryObj;

export const Demo: Story = {
  render: () => <TabBarMock />,
};
