import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

const Card: React.FC<{ label?: string }> = ({ label = 'Hello Storybook 👋' }) => (
  <div style={{
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    padding: 24, borderRadius: 12, border: '1px solid #ddd', minWidth: 280
  }}>
    <h3 style={{ margin: 0, marginBottom: 12 }}>Demo</h3>
    <p style={{ margin: 0 }}>{label}</p>
  </div>
);

const meta: Meta<typeof Card> = {
  title: 'Getting Started/Hello',
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;
export const Basic: Story = { args: { label: 'Hello Storybook 👋' } };
export const Custom: Story = { args: { label: 'Custom label via Controls' } };
