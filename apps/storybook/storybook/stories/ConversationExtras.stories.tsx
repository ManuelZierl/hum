import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  ConversationHeader,
  DaySeparator,
  ComposerMock,
} from '@mchat/message-ui';

const meta: Meta = { title: 'Conversation/Extras' };
export default meta;

type Story = StoryObj;

export const HeaderDemo: Story = {
  render: () => <ConversationHeader />,
};

export const DaySeparatorDemo: Story = {
  render: () => <DaySeparator label="Yesterday" />,
};

export const ComposerDemo: Story = {
  render: () => <ComposerMock />,
};
