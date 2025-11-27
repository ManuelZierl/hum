import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTheme,
  Icon,
  TopBar,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@hum/ui-components';
import { useTranslation } from 'react-i18next';
import { Button } from '@hum/ui-components';

export interface SettingsScreenProps {
  onBack?: () => void;
  children?: React.ReactNode;
  profileName?: string;
  profileStatus?: string;
  profileImageUri?: string;
  onClearStorage?: () => Promise<void> | void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  children,
  profileName,
  profileStatus,
  profileImageUri = 'https://picsum.photos/200/200',
  onClearStorage,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = React.useState('');
  const { t } = useTranslation();
  const clearLabel = t('settings.actions.clear_storage', {
    defaultValue: 'Clear payments data',
  });
  const clearAccessibilityLabel = 'settings.actions.clear_storage';
  const handleClearStorage = React.useCallback(async () => {
    if (!onClearStorage) return;
    try {
      await onClearStorage();
    } catch (error) {
      console.warn('[SettingsScreen] clear storage failed', error);
    }
  }, [onClearStorage]);
  const pName = profileName ?? t('labels.your_name');
  const pStatus = profileStatus ?? t('labels.profile_status_default');
  const fallbackInitials = pName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .filter(Boolean)
    .join('');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom },
      ]}
    >
      <TopBar
        backButton={!!onBack}
        onBackPress={onBack}
        title={t('nav.settings')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
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
              size={24}
              color={colors.mutedForeground}
              style={{ marginRight: spacing.md }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('placeholders.search')}
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.searchInput,
                {
                  color: colors.foreground,
                  fontSize: type.size.md,
                  paddingVertical: spacing.sm,
                },
              ]}
              accessibilityLabel={t('actions.search')}
              accessibilityRole="search"
            />
          </View>
        </View>

        <View
          style={[
            styles.profileSection,
            { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
          ]}
        >
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <Avatar size={64} accessibilityRole="image">
                <AvatarImage
                  source={{ uri: profileImageUri }}
                  accessibilityLabel={t('labels.profile')}
                />
                {!!fallbackInitials && (
                  <AvatarFallback>{fallbackInitials}</AvatarFallback>
                )}
              </Avatar>
              <View style={{ marginLeft: spacing.md }}>
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: type.size.lg,
                    fontWeight: type.weight.medium,
                  }}
                >
                  {pName}
                </Text>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: type.size.sm,
                  }}
                >
                  {pStatus}
                </Text>
              </View>
            </View>
            <Icon
              name="qr-code"
              size={type.size.lg}
              color={colors.mutedForeground}
            />
          </View>
        </View>

        <View style={{ paddingBottom: spacing.xl }}>{children}</View>

        {onClearStorage ? (
          <View
            style={{
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
            }}
          >
            <Button
              variant="outline"
              onPress={handleClearStorage}
              accessibilityLabel={clearAccessibilityLabel}
              testID="clear-storage"
            >
              {clearLabel}
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default SettingsScreen;
