import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { DummyTest } from '@hum/ui-components';

const Card: React.FC = () => <DummyTest />;

const meta: Meta<typeof Card> = {
  title: 'Example/DummyTest',
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;
export const Basic: Story = { args: { label: 'Hello Storybook 👋' } };
export const Custom: Story = { args: { label: 'Custom label via Controls' } };
