import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  QrCode,
  User,
  Shield,
  Bell,
  HelpCircle,
} from 'lucide-react-native';
import { SettingsItem, useTheme } from '@hum/ui-components';

export interface SettingsScreenProps {
  onBack?: () => void;
}

const baseStyles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    fontWeight: '500',
  },
  searchWrapper: {},
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0,
  },
  searchInput: {
    flex: 1,
  },
  profileSection: {},
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  name: {
    fontWeight: '500',
  },
  status: {},
  list: {},
  appInfo: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  appInfoText: {},
  appInfoVersion: { marginTop: 4 },
  appInfoCopyright: { marginTop: 8 },
  appInfoBuild: { marginTop: 4 },
  spacer: {
    height: 1,
  },
});

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const { colors, spacing, type, radius } = useTheme();

  const containerStyle = React.useMemo(
    () => [
      baseStyles.container,
      { backgroundColor: colors.background, paddingTop: insets.top },
    ],
    [colors.background, insets.top],
  );

  const headerStyle = React.useMemo(
    () => [
      baseStyles.header,
      {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderBottomColor: colors.border,
      },
    ],
    [colors.border, spacing.lg],
  );

  const headerTextStyle = React.useMemo(
    () => [
      baseStyles.headerText,
      { fontSize: type.size.xl, color: colors.foreground },
    ],
    [type.size.xl, colors.foreground],
  );

  const searchWrapperStyle = React.useMemo(
    () => [baseStyles.searchWrapper, { padding: spacing.lg }],
    [spacing.lg],
  );

  const searchInnerStyle = React.useMemo(
    () => [
      baseStyles.searchInner,
      {
        backgroundColor: colors.muted,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
      },
    ],
    [colors.muted, radius.md, spacing.lg],
  );

  const searchInputStyle = React.useMemo(
    () => [
      baseStyles.searchInput,
      {
        paddingVertical: spacing.sm,
        marginLeft: spacing.sm,
        color: colors.foreground,
        fontSize: type.size.base,
      },
    ],
    [spacing.sm, colors.foreground, type.size.base],
  );

  const profileSectionStyle = React.useMemo(
    () => [
      baseStyles.profileSection,
      {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
      },
    ],
    [spacing.lg],
  );

  const avatarStyle = React.useMemo(
    () => [baseStyles.avatar, { marginRight: spacing.md }],
    [spacing.md],
  );

  const nameStyle = React.useMemo(
    () => [
      baseStyles.name,
      { fontSize: type.size.lg, color: colors.foreground },
    ],
    [type.size.lg, colors.foreground],
  );

  const statusStyle = React.useMemo(
    () => [
      baseStyles.status,
      { fontSize: type.size.sm, color: colors.mutedForeground, marginTop: 2 },
    ],
    [type.size.sm, colors.mutedForeground],
  );

  const listStyle = React.useMemo(
    () => [baseStyles.list, { paddingBottom: spacing.xl }],
    [spacing.xl],
  );

  const spacerStyle = React.useMemo(
    () => [baseStyles.spacer, { height: spacing.md }],
    [spacing.md],
  );

  const appInfoStyle = React.useMemo(
    () => [
      baseStyles.appInfo,
      {
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopColor: colors.border,
        paddingHorizontal: spacing.lg,
      },
    ],
    [spacing.xl, spacing.lg, colors.border],
  );

  const appInfoTextStyle = React.useMemo(
    () => [
      baseStyles.appInfoText,
      { color: colors.mutedForeground, fontSize: type.size.sm },
    ],
    [colors.mutedForeground, type.size.sm],
  );

  const iconColor = colors.mutedForeground;

  return (
    <View style={containerStyle}>
      <View style={headerStyle}>
        <Text accessibilityRole="header" style={headerTextStyle}>
          Settings
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={listStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={searchWrapperStyle}>
          <View style={searchInnerStyle}>
            <Search color={iconColor} size={20} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={colors.mutedForeground}
              style={searchInputStyle}
              accessible
              accessibilityLabel="search"
            />
          </View>
        </View>

        <View style={profileSectionStyle}>
          <View style={baseStyles.profileRow}>
            <View style={baseStyles.profileLeft}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1719257751404-1dea075324bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTY0NjA5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                }}
                accessibilityLabel="Profile"
                style={avatarStyle}
              />
              <View>
                <Text style={nameStyle}>Your Name</Text>
                <Text style={statusStyle}>Hey there! I am using Hum.</Text>
              </View>
            </View>
            <QrCode color={iconColor} size={24} />
          </View>
        </View>

        <View>
          <SettingsItem
            icon={<User color={iconColor} size={24} />}
            title="Account"
            subtitle="Security notifications, change number"
          />

          <SettingsItem
            icon={<Shield color={iconColor} size={24} />}
            title="Privacy"
            subtitle="Block contacts, disappearing messages"
          />

          <SettingsItem
            icon={<Bell color={iconColor} size={24} />}
            title="Notifications"
            subtitle="Message, group & call tones"
          />

          <SettingsItem
            icon={<Search color={iconColor} size={24} />}
            title="Storage and data"
            subtitle="Network usage, auto-download"
          />

          <SettingsItem
            icon={<HelpCircle color={iconColor} size={24} />}
            title="Help"
            subtitle="Help center, contact us, privacy policy"
          />

          <View style={spacerStyle} />

          <SettingsItem
            icon={<User color={iconColor} size={24} />}
            title="Linked devices"
            subtitle="Manage connected devices"
          />

          <SettingsItem
            icon={<Shield color={iconColor} size={24} />}
            title="Two-step verification"
            subtitle="Add extra security to your account"
          />

          <SettingsItem
            icon={<Bell color={iconColor} size={24} />}
            title="Request account info"
            subtitle="Request a report of your account information"
          />

          <SettingsItem
            icon={<Search color={iconColor} size={24} />}
            title="App language"
            subtitle="English (device's language)"
          />

          <SettingsItem
            icon={<HelpCircle color={iconColor} size={24} />}
            title="Theme"
            subtitle="Choose your app theme"
          />

          <SettingsItem
            icon={<User color={iconColor} size={24} />}
            title="Wallpaper"
            subtitle="Change your chat wallpaper"
          />

          <SettingsItem
            icon={<Shield color={iconColor} size={24} />}
            title="Sound"
            subtitle="Ringtone and notification sounds"
          />

          <SettingsItem
            icon={<Bell color={iconColor} size={24} />}
            title="Invite friends"
            subtitle="Share Hum with friends and family"
          />

          <SettingsItem
            icon={<Search color={iconColor} size={24} />}
            title="Delete my account"
            subtitle="Delete your account and erase your message history"
          />

          <View style={appInfoStyle}>
            <Text style={appInfoTextStyle}>Hum for Web</Text>
            <Text style={[appInfoTextStyle, baseStyles.appInfoVersion]}>
              Version 1.0.0
            </Text>
            <Text style={[appInfoTextStyle, baseStyles.appInfoCopyright]}>
              © 2024 Hum Technologies
            </Text>
            <Text style={[appInfoTextStyle, baseStyles.appInfoBuild]}>
              Build 2024.08.29
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
