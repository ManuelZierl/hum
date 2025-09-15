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
import { useTheme, Icon, TopBar } from '@hum/ui-components';
import { useTranslation } from 'react-i18next';

export interface SettingsScreenProps {
  onBack?: () => void;
  children?: React.ReactNode;
  profileName?: string;
  profileStatus?: string;
  profileImageUri?: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  children,
  profileName,
  profileStatus,
  profileImageUri = 'https://picsum.photos/200/200',
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = React.useState('');
  const { t } = useTranslation();
  const pName = profileName ?? t('labels.your_name');
  const pStatus = profileStatus ?? t('labels.profile_status_default');

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
              <Image
                source={{ uri: profileImageUri }}
                style={styles.profileImage}
                accessibilityLabel={t('labels.profile')}
              />
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
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

export default SettingsScreen;
