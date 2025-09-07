import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme/theme-provider';
import { Icon, type IconName } from './theme/icon';

export type TopBarItem =
  | {
      type: 'icon';
      name: IconName;
      onPress?: () => void;
      a11yLabel?: string;
      testID?: string;
    }
  | {
      type: 'text';
      label: string;
      onPress?: () => void;
      a11yLabel?: string;
      testID?: string;
    }
  | { type: 'node'; element: React.ReactNode; testID?: string };

export interface TopBarProps {
  backButton?: boolean;
  onBackPress?: () => void;
  title?: string | null;
  titleIconName?: IconName | null;
  leftItems?: TopBarItem[];
  rightItems?: TopBarItem[];
  testID?: string;
  // Optional search row
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onChangeSearch?: (text: string) => void;
  onSubmitSearch?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  backButton = false,
  onBackPress,
  title = null,
  titleIconName = null,
  leftItems = [],
  rightItems = [],
  testID,
  showSearch = false,
  searchPlaceholder = 'Search',
  searchValue,
  onChangeSearch,
  onSubmitSearch,
}) => {
  const { colors, spacing, type, radius } = useTheme();
  const insets = useSafeAreaInsets();

  const renderItem = (item: TopBarItem, index: number) => {
    const commonTest = item.testID
      ? { testID: item.testID, 'data-testid': item.testID }
      : {};
    const marginStyle = { marginLeft: index === 0 ? 0 : spacing.md };
    if (item.type === 'icon') {
      return (
        <Pressable
          key={index}
          onPress={item.onPress}
          accessibilityRole={item.onPress ? 'button' : undefined}
          accessibilityLabel={item.a11yLabel}
          style={marginStyle}
          {...commonTest}
        >
          <Icon name={item.name} size={24} color={colors.foreground} />
        </Pressable>
      );
    }
    if (item.type === 'text') {
      return (
        <Pressable
          key={index}
          onPress={item.onPress}
          accessibilityRole={item.onPress ? 'button' : undefined}
          accessibilityLabel={item.a11yLabel}
          style={marginStyle}
          {...commonTest}
        >
          <Text style={[styles.iconText, { color: colors.foreground }]}>
            {item.label}
          </Text>
        </Pressable>
      );
    }
    return (
      <View key={index} style={marginStyle} {...commonTest}>
        {item.element}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.background,
        },
      ]}
      {...(testID ? { testID, 'data-testid': testID } : {})}
    >
      {/* Main top bar row */}
      <View style={styles.row}>
        <View style={styles.side}>
          {backButton ? (
            <Pressable
              onPress={onBackPress}
              accessibilityRole={onBackPress ? 'button' : undefined}
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={leftItems.length ? { marginRight: spacing.md } : undefined}
              testID="back-button"
              {...{ 'data-testid': 'back-button' }}
            >
              <Text style={[styles.backIcon, { color: colors.foreground }]}>
                ‹
              </Text>
            </Pressable>
          ) : null}
          {leftItems.map((item, i) => renderItem(item, i))}
        </View>

        <View style={styles.center}>
          {titleIconName ? (
            <View
              testID="title-icon"
              {...{ 'data-testid': 'title-icon' }}
              style={title ? { marginRight: spacing.xs } : undefined}
            >
              <Icon name={titleIconName} size={24} color={colors.humPrimary} />
            </View>
          ) : null}
          {title ? (
            <Text
              style={[
                styles.title,
                {
                  color: colors.foreground,
                  fontSize: type.size.lg,
                  fontWeight: type.weight.medium,
                },
              ]}
            >
              {title}
            </Text>
          ) : null}
        </View>

        <View style={[styles.side, styles.right]}>
          {rightItems.map((item, i) => renderItem(item, i))}
        </View>
      </View>

      {/* Optional search row */}
      {showSearch ? (
        <View style={{ marginTop: spacing.sm }}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <Icon
              name="search"
              size={18}
              color={colors.mutedForeground}
              style={{ marginRight: spacing.sm }}
            />
            <TextInput
              testID="topbar-search-input"
              {...{ 'data-testid': 'topbar-search-input' }}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.mutedForeground}
              value={searchValue}
              onChangeText={onChangeSearch}
              onSubmitEditing={onSubmitSearch}
              returnKeyType="search"
              style={{ color: colors.foreground, paddingVertical: spacing.sm }}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    textAlign: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  right: {
    justifyContent: 'flex-end',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default TopBar;
