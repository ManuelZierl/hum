import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../ui-components/src/theme/ThemeProvider';
import { SettingsItem } from '../../ui-components/src/settings-item';
import { Icon } from '../../ui-components/src/theme/Icon';

export interface SettingsScreenProps {
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = React.useState('');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingVertical: spacing.lg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[styles.backButton, { left: spacing.lg }]}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size.xl,
              }}
            >
              ‹
            </Text>
          </Pressable>
        ) : null}
        <Text
          testID="settings-title"
          style={{
            color: colors.foreground,
            fontSize: type.size.xl,
            fontWeight: type.weight.medium,
          }}
        >
          Settings
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        {/* Search Bar */}
        <View style={{ padding: spacing.lg }}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.muted,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.lg,
              },
            ]}
          >
            <Icon
              name="search"
              size={20}
              color={colors.mutedForeground}
              style={{ marginRight: spacing.md }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.searchInput,
                {
                  color: colors.foreground,
                  fontSize: type.size.md,
                  paddingVertical: spacing.sm,
                },
              ]}
              accessibilityLabel="Search"
              accessibilityRole="search"
            />
          </View>
        </View>

        {/* Profile Section */}
        <View
          style={[
            styles.profileSection,
            { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
          ]}
        >
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1719257751404-1dea075324bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NTY0NjA5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                }}
                style={styles.profileImage}
                accessibilityLabel="Profile"
              />
              <View style={{ marginLeft: spacing.md }}>
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: type.size.lg,
                    fontWeight: type.weight.medium,
                  }}
                >
                  Your Name
                </Text>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: type.size.sm,
                  }}
                >
                  Hey there! I am using Hum.
                </Text>
              </View>
            </View>
            <Icon
              name="upc-scan"
              size={type.size.lg}
              color={colors.mutedForeground}
            />
          </View>
        </View>

        {/* Settings Items */}
        <View style={{ paddingBottom: spacing.xl }}>
          <SettingsItem
            icon={<Icon name="person" color={colors.foreground} />}
            title="Account"
            subtitle="Security notifications, change number"
          />
          <SettingsItem
            icon={<Icon name="shield" color={colors.foreground} />}
            title="Privacy"
            subtitle="Block contacts, disappearing messages"
          />
          <SettingsItem
            icon={<Icon name="bell" color={colors.foreground} />}
            title="Notifications"
            subtitle="Message, group & call tones"
          />
          <SettingsItem
            icon={<Icon name="box" color={colors.foreground} />}
            title="Storage and data"
            subtitle="Network usage, auto-download"
          />
          <SettingsItem
            icon={<Icon name="question-circle" color={colors.foreground} />}
            title="Help"
            subtitle="Help center, contact us, privacy policy"
          />
          <View style={{ height: spacing.md }} />
          <SettingsItem
            icon={<Icon name="people" color={colors.foreground} />}
            title="Linked devices"
            subtitle="Manage connected devices"
          />
          <SettingsItem
            icon={<Icon name="lock" color={colors.foreground} />}
            title="Two-step verification"
            subtitle="Add extra security to your account"
          />
          <SettingsItem
            icon={<Icon name="file-earmark-text" color={colors.foreground} />}
            title="Request account info"
            subtitle="Request a report of your account information"
          />
          <SettingsItem
            icon={<Icon name="globe" color={colors.foreground} />}
            title="App language"
            subtitle="English (device's language)"
          />
          <SettingsItem
            icon={<Icon name="palette" color={colors.foreground} />}
            title="Theme"
            subtitle="Choose your app theme"
          />
          <SettingsItem
            icon={<Icon name="image" color={colors.foreground} />}
            title="Wallpaper"
            subtitle="Change your chat wallpaper"
          />
          <SettingsItem
            icon={<Icon name="volume-up" color={colors.foreground} />}
            title="Sound"
            subtitle="Ringtone and notification sounds"
          />
          <SettingsItem
            icon={<Icon name="envelope" color={colors.foreground} />}
            title="Invite friends"
            subtitle="Share Hum with friends and family"
          />
          <SettingsItem
            icon={<Icon name="trash" color={colors.foreground} />}
            title="Delete my account"
            subtitle="Delete your account and erase your message history"
          />
          {/* App Info */}
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
            <Text
              style={{ color: colors.mutedForeground, fontSize: type.size.sm }}
            >
              Hum for Web
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: type.size.sm,
                marginTop: spacing.xs,
              }}
            >
              Version 1.0.0
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: type.size.sm,
                marginTop: spacing.xs,
              }}
            >
              © 2024 Hum Technologies
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: type.size.sm,
                marginTop: spacing.xs,
              }}
            >
              Build 2024.08.29
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
  },
  scroll: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileSection: {},
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  appInfo: {
    alignItems: 'center',
  },
});

export default SettingsScreen;
