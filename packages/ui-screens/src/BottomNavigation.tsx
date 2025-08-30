import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@hum/ui-components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  chatsBadgeCount?: number;
}

interface NavItem {
  id: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  badgeCount?: number;
}

const NavItem: React.FC<{
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, isActive, onPress }) => {
  const { colors, spacing, type } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.navItem,
        { paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      testID={`nav-item-${item.id}`}
    >
      <View style={styles.iconWrapper}>
        <Feather
          name={item.icon}
          size={24}
          color={isActive ? colors.humPrimary : colors.mutedForeground}
        />
        {item.badgeCount && item.badgeCount > 0 && (
          <View
            testID={`badge-${item.id}`}
            style={[
              styles.badge,
              {
                backgroundColor: colors.humPrimary,
              },
            ]}
          >
            <Text
              testID={`badge-text-${item.id}`}
              style={[
                styles.badgeText,
                {
                  color: colors.humPrimaryForeground,
                  fontSize: type.size.sm - 2,
                },
              ]}
            >
              {item.badgeCount > 9 ? '9+' : item.badgeCount}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.label,
          {
            marginTop: spacing.xs,
            color: isActive ? colors.humPrimary : colors.mutedForeground,
            fontSize: type.size.sm,
            fontWeight: type.weight.medium,
          },
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'chats',
  onTabChange,
  chatsBadgeCount = 0,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const navItems: NavItem[] = [
    {
      id: 'chats',
      icon: 'message-circle',
      label: 'Chats',
      badgeCount: chatsBadgeCount,
    },
    { id: 'lightning', icon: 'zap', label: 'Lightning' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <View
      testID="bottom-navigation"
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onPress={() => onTabChange?.(item.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {},
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '700',
  },
});

export default BottomNavigation;
