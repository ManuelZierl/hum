import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ProfileCard, SectionHeader, SettingsListItem } from '@mchat/mobile-ui';

const meta: Meta = { title: 'Settings/Components' };
export default meta;

type Story = StoryObj;

export const ProfileCardDemo: Story = {
  render: () => <ProfileCard name="Jane Doe" handle="@jane" />,
};

export const SectionHeaderDemo: Story = {
  render: () => <SectionHeader title="Account" />,
};

export const SettingsListItemDemo: Story = {
  render: () => <SettingsListItem label="Privacy" />,
};
