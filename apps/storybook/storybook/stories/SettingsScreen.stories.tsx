import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SettingsScreen,
  AppVersion,
  BuildDateDisplay,
  CopyrightYear,
} from '@hum/ui-screens';
import { SettingsItem, Icon, useTheme } from '@hum/ui-components';
import { View, Text, StyleSheet } from 'react-native';

const meta: Meta<typeof SettingsScreen> = {
  title: 'Screens/SettingsScreen',
  component: SettingsScreen,
  argTypes: {
    onBack: { action: 'back' },
  },
  args: {
    profileImageUri: 'https://picsum.photos/200/200',
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsScreen>;

const RenderSettings = (args: React.ComponentProps<typeof SettingsScreen>) => {
  const { colors, spacing, type } = useTheme();
  return (
    <SettingsScreen {...args}>
      <SettingsItem
        icon={<Icon name="person" size={24} color={colors.humPrimary} />}
        title="Account"
        subtitle="Security notifications, change number"
      />
      <SettingsItem
        icon={<Icon name="shield" size={24} color={colors.humPrimary} />}
        title="Privacy"
        subtitle="Block contacts, disappearing messages"
      />
      <SettingsItem
        icon={<Icon name="bell" size={24} color={colors.humPrimary} />}
        title="Notifications"
        subtitle="Message, group & call tones"
      />
      <SettingsItem
        icon={<Icon name="box" size={24} color={colors.humPrimary} />}
        title="Storage and data"
        subtitle="Network usage, auto-download"
      />
      <SettingsItem
        icon={
          <Icon name="question-circle" size={24} color={colors.humPrimary} />
        }
        title="Help"
        subtitle="Help center, contact us, privacy policy"
      />
      <View style={{ height: spacing.md }} />
      <SettingsItem
        icon={<Icon name="people" size={24} color={colors.humPrimary} />}
        title="Linked devices"
        subtitle="Manage connected devices"
      />
      <SettingsItem
        icon={<Icon name="lock" size={24} color={colors.humPrimary} />}
        title="Two-step verification"
        subtitle="Add extra security to your account"
      />
      <SettingsItem
        icon={<Icon name="file-text" size={24} color={colors.humPrimary} />}
        title="Request account info"
        subtitle="Request a report of your account information"
      />
      <SettingsItem
        icon={<Icon name="globe" size={24} color={colors.humPrimary} />}
        title="App language"
        subtitle="English (device's language)"
      />
      <SettingsItem
        icon={<Icon name="palette" size={24} color={colors.humPrimary} />}
        title="Theme"
        subtitle="Choose your app theme"
      />
      <SettingsItem
        icon={<Icon name="image" size={24} color={colors.humPrimary} />}
        title="Wallpaper"
        subtitle="Change your chat wallpaper"
      />
      <SettingsItem
        icon={<Icon name="volume-up" size={24} color={colors.humPrimary} />}
        title="Sound"
        subtitle="Ringtone and notification sounds"
      />
      <SettingsItem
        icon={<Icon name="envelope" size={24} color={colors.humPrimary} />}
        title="Invite friends"
        subtitle="Share Hum with friends and family"
      />
      <SettingsItem
        icon={<Icon name="trash" size={24} color={colors.humPrimary} />}
        title="Delete my account"
        subtitle="Delete your account and erase your message history"
      />
      <View
        style={[
          styles.appInfo,
          {
            marginTop: spacing.xl,
            paddingTop: spacing.lg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: type.size.sm }}>
          Hum for Web
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: type.size.sm,
            marginTop: spacing.xs,
          }}
        >
          Version {AppVersion}
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: type.size.sm,
            marginTop: spacing.xs,
          }}
        >
          © {CopyrightYear} Hum Technologies
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: type.size.sm,
            marginTop: spacing.xs,
          }}
        >
          Build {BuildDateDisplay}
        </Text>
      </View>
    </SettingsScreen>
  );
};

export const Default: Story = {
  render: (args) => <RenderSettings {...args} />,
};

export const WithBackButton: Story = {
  args: { onBack: () => {} },
  render: (args) => <RenderSettings {...args} />,
};

const styles = StyleSheet.create({
  appInfo: {
    alignItems: 'center',
  },
});
