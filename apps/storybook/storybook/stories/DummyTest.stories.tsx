import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DummyScreen } from '@hum/ui-screens';

const Card: React.FC = () => <DummyScreen />;

const meta: Meta<typeof Card> = {
  title: 'Example/DummyScreen',
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;
export const Basic: Story = { args: { label: 'Hello Storybook 👋' } };
export const Custom: Story = { args: { label: 'Custom label via Controls' } };
